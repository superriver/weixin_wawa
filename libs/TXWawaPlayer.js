var TXWawaPlayer = (function () {
  var global = {
    playId: '',
    websocket: null,
    lastMoved: null,
    listeners: {
    },
    remainTime: 60,
    Directive: {
      CTL_LEFT_START: "left",
      CTL_LEFT_END: "left_end",
      CTL_RIGHT_START: "right",
      CTL_RIGHT_END: "right_end",
      CTL_FORWARD_START: "up",
      CTL_FORWARD_END: "up_end",
      CTL_BACKWARD_START: "down",
      CTL_BACKWARD_END: "down_end",
      CTL_CATCH: "catch",
      CTL_STOP: "stop"
    },
    MachineState: {
      WAIT: 0,
      PLAY: 1,
      CATCH: 2,
      ERROR: 3
    },
    ErrorCode: {
      WebSocketClose: { "code": 1001, "msg": "websocket close" },
      WebSocketError: { "code": 1002, "msg": "websocket error" },
      StateError: { "code": 2001, "msg": "machine state error" },
      UnInited: { "code": 3001, "msg": "init error" },
      ParamError: { "code": 3002, "msg": "params error" }
    },
    remainTimeSto: null,
    inited: null
  }
  var destroy = function () {
    WSManager.close();
    global.listeners = {}
    global.lastMoved = null
    global.inited = false
    clearInterval(global.remainTimeSto)
  }

  function genUUID() {
    return Date.now().toString(32) + Math.random().toString(32).split('.')[1];
  }

  var WSManager = {

    init: function (url) {

      var self = this
      // Create WebSocket connection.
      if (global.websocket && global.websocket.readyState === 1) {
        return
      }

      global.websocket = new WebSocket(url)
      // Connection opened
      global.websocket.addEventListener('open', function (event) {
        // global.websocket.send('Hello Server!')
      })

      // Listen for messages
      global.websocket.addEventListener('message', function (event) {
        console.debug('Message from server', event.data)
        var json = JSON.parse(event.data)
        self.onMessage(json)
      })

      global.websocket.addEventListener('close', function (event) {
        if (global.listeners.OnClose) {
          global.listeners.OnClose(global.ErrorCode.WebSocketClose, event)
        }
      })
      global.websocket.addEventListener('error', function (event) {
        if (global.listeners.OnError) {
          global.listeners.OnError(global.ErrorCode.WebSocketError, event)
        }
      })
    },

    sendMessage: function (data) {
      var self = this
      if (!global.websocket) {
        return
      }
      if (global.websocket && global.websocket.readyState === 1) {
        console.debug('wsSendMessage', data)
        global.websocket.send(JSON.stringify(data))
      } else {
        //断开连接的异常处理
      }
    },

    onMessage: function (data) {
      var self = this
      console.debug('onMessage', data)
      switch (data.type) {
        case "Wait":
          if (global.listeners.OnWait)
            global.listeners.OnWait(data.data)
          break
        case "Ready":
          if (global.listeners.OnReady)
            global.listeners.OnReady(data)
          break
        case "State":
          handleStateChange(data)
          break
        case "Coin":
          if (global.listeners.OnCoin)
            global.listeners.OnCoin(data)
          break
        case "Result":
          // this.sendMessage({
          //   "type": "Close",
          //   "data": data,
          //   "extra": ""
          // })
          // self.close()
          if (global.listeners.OnResult)
            global.listeners.OnResult(data.data, data.extra)
          break
        case "Delay":
          if (global.listeners.OnDelay)
            global.listeners.OnDelay(data)
          break
        case "Timeout":
          if (global.listeners.OnTimeout) {
            self.close()
            global.listeners.OnTimeout(data)
          }
          break
        case "Time":
          try {
            var value = Number(data.data);
            if (!isNaN(value)) { // 如果是一个正常的数字
              if (global.listeners.OnTime) {
                global.listeners.OnTime(value)
              }
              global.remainTime = value;
            }
          } catch (e) {

          }
          break;
        default:
          break
      }
    },

    close: function () {
      if (global.websocket) {
        global.websocket.close()
        global.websocket = null
      }
    }
  }

  function handleStateChange(data) {
    switch (data.data) {
      case "PLAY":
        clearInterval(global.remainTimeSto);
        // global.remainTime = 60
        global.remainTimeSto = setInterval(function () {
          global.remainTime--
          if (global.remainTime < 0) {
            global.remainTime = 0
          }
          global.listeners.OnTime(global.remainTime)
        }, 1000)
      case "WAIT":
      case "CATCH":
        if (global.listeners.OnState) {
          global.listeners.OnState(global.MachineState[data.data])
        }
        break;
      case "ERROR":
        if (global.listeners.OnState) {
          global.listeners.OnState(global.MachineState[data.data])
        }
        if (global.listeners.OnError) {
          global.listeners.OnError(global.ErrorCode.StateError)
        }
        break;
    }
  }

  function checkInit(callback) {
    if (global.inited) {
      callback();
    } else {
      if (global.listeners.OnError) {
        var error = {
          code: global.ErrorCode.UnInited.code,
          msg: global.ErrorCode.UnInited.msg,
          extra: '尚未初始化'
        }
        global.listeners.OnError(error)
      }
    }
  }

  function init(listeners) {
    destroy();
    global.listeners.OnWait = listeners.OnWait || null
    global.listeners.OnReady = listeners.OnReady || null
    global.listeners.OnState = listeners.OnState || null
    global.listeners.OnResult = listeners.OnResult || null
    global.listeners.OnTime = listeners.OnTime || null
    global.listeners.OnClose = listeners.OnClose || null
    global.listeners.OnError = listeners.OnError || null

    var list = ['OnWait', 'OnReady', 'OnState', 'OnResult', 'OnTime', 'OnClose', 'OnError'];
    var unbind_list = [];
    list.forEach(function (item) {
      if (listeners[item]) {
        global.listeners[item] = listeners[item]
      } else {
        unbind_list.push(item);
      }
    })
    if (unbind_list.length > 0) {
      var error = {
        code: global.ErrorCode.ParamError.code,
        msg: global.ErrorCode.ParamError.msg,
        extra: unbind_list + ' 接口未绑定'
      }
      global.listeners.OnError(error)
      return;
    }
    global.inited = true;
  }

  function startQueue(playId, url) {
    // url 为必传， 如果只有一个参数，则认为是url
    if(arguments.length == 1){
      global.playId = genUUID();
      url = playId;
    } else {
      global.playId = playId || genUUID();
    }
    checkInit(function () {
      if (!url) {
        if (global.listeners.OnError) {
          var error = {
            code: global.ErrorCode.ParamError.code,
            msg: global.ErrorCode.ParamError.msg,
            extra: 'url 不能为空'
          }
          global.listeners.OnError(error)
        }
        return;
      }
      WSManager.init(url);
    })
  }



  function startGame() {
    checkInit(function () {
      WSManager.sendMessage({
        "type": "Insert",
        "data": 1,
        "extra": global.playId
      });
    })
  }

  function quitGame() {
    checkInit(function () {
      WSManager.sendMessage({
        "type": "Close",
        "data": "",
        "extra": ""
      })
      destroy()
    })
  }

  function controlClaw(cmd) {
    var data = ''
    checkInit(function () {
      if (global.lastMoved) {
        switch (global.lastMoved) {
          case global.Directive.CTL_LEFT_START:
            data = "A"
            break
          case global.Directive.CTL_RIGHT_START:
            data = "D"
            break
          case global.Directive.CTL_FORWARD_START:
            data = "W"
            break
          case global.Directive.CTL_BACKWARD_START:
            data = "S"
            break
        }
        WSManager.sendMessage({
          "type": "Control",
          "data": data,
          "extra": ""
        })
      }
      global.lastMoved = null
      if (cmd !== global.Directive.CTL_STOP) {
        console.debug('cmd', cmd)
        switch (cmd) {
          case global.Directive.CTL_LEFT_START:
            data = "l"
            break
          case global.Directive.CTL_RIGHT_START:
            data = "r"
            break
          case global.Directive.CTL_FORWARD_START:
            data = "u"
            break
          case global.Directive.CTL_BACKWARD_START:
            data = "d"
            break
          case global.Directive.CTL_CATCH:
            data = "b"
            break
        }
        global.lastMoved = cmd
      }
      WSManager.sendMessage({
        "type": "Control",
        "data": data,
        "extra": ""
      })
    })
  }

  return {
    init: init,
    startQueue: startQueue,
    startGame: startGame,
    quitGame: quitGame,
    destroy: destroy,
    controlClaw: controlClaw,
    Directive: global.Directive,
    ErrorCode: global.ErrorCode,
    MachineState: global.MachineState,
    logOn: true
  }
})()