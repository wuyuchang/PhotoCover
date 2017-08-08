const DEFAULT_OPTIONS = {
  RADIUS: 20,
  MAX_WIDTH: 800,
  COLOR: 'black',
  MOUSE: 'pen',
  PEN_BORDER_COLOR: 'red',
  ERASER_BORDER_COLOR: '#666',
  PEN: 'pen',
  ERASER: 'eraser',
  LINECAP: 'round'
}

class PhotoCover {
  win: Window = window
  doc: HTMLDocument = document
  body: HTMLElement = document.body

  mouse: HTMLDivElement 
  width: number // width of canvas and image
  height: number // height of canvas and image
  left: number  // 
  top: number 
  canvas: HTMLCanvasElement = document.createElement('canvas')
  ctx: CanvasRenderingContext2D = this.canvas.getContext('2d') as CanvasRenderingContext2D

  radius = DEFAULT_OPTIONS.RADIUS   // radius of each circle of line
  maxWidth = DEFAULT_OPTIONS.MAX_WIDTH
  color = DEFAULT_OPTIONS.COLOR // draw color
  linecap= DEFAULT_OPTIONS.LINECAP // 
  mouseType = DEFAULT_OPTIONS.MOUSE
  readonly isMobile = navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('Android') > -1
  operateHistories: Array<Array<any>> = []
  img: HTMLImageElement 

  registeredEvents: Array<any> = []

  constructor(selector: HTMLImageElement | string) {

    if (typeof selector === 'object') { this.img = selector }
    else if (typeof selector === 'string') { this.img = document.querySelector(selector) as HTMLImageElement }
    
    // initial canvas and its size and position
    this.width = this.img.width
    this.height = this.img.height

    this._init()
  }

  _init(): void {

    let [body, win, img] = [this.body, this.win, this.img]

    this._async()

    this.canvas.width = img.width
    this.canvas.height = img.height

    body.appendChild(this.canvas)

    if (!this.isMobile) { this._initMouse() }

    // async canvas position and size during browser resize
    let resize = ((e: any) => {
      this._async()
    }).bind(this)
    win.addEventListener('resize', resize, false)
    this._pushRegisteredEvents(win, 'resize', resize)


    let currentOperate: Array<Array<any>> = []

    let canvasMouseDown = ((e: any) => {
      e.preventDefault()

      const [x, y] = this.getCoordinateByEvent(e)
      this.ctx.moveTo(x, y)

      currentOperate = []

      if (this.isOnCanvas(x, y, true)) {

        this.ctx.beginPath()
        currentOperate.push(['MOVE_TO', x, y])

        if (!this.isMobile) { win.addEventListener('mousemove', canvasMouseMove, false) }
        else { win.addEventListener('touchmove', canvasMouseMove, false) }
      }
      
    }).bind(this)

    let canvasMouseMove = ((e: any) => {
      e.preventDefault()
      currentOperate.push(this.drawByEvent(e))
    }).bind(this)

    let canvasMouseUp = ((e: any) => {
      e.preventDefault()

      if (!this.isMobile) { win.removeEventListener('mousemove', canvasMouseMove, false) }
      else { win.removeEventListener('touchmove', canvasMouseMove, false) }
      
      let coordinate = this.getCoordinateByEvent(e)
      let [x, y] = [e.pageX, e.pageY]

      if (this.isOnCanvas(x, y)) {
        this.operateHistories.push(currentOperate)
        currentOperate = []
        console.log(this.operateHistories)
      }
    }).bind(this)

    // canvas down
    if (!this.isMobile) {
      win.addEventListener('mousedown', canvasMouseDown, false)
      this._pushRegisteredEvents(win, 'mousedown', canvasMouseDown)

      win.addEventListener('mouseup', canvasMouseUp, false)
      this._pushRegisteredEvents(win, 'mouseup', canvasMouseUp) 
    } else {
      win.addEventListener('touchstart', canvasMouseDown, false)
      this._pushRegisteredEvents(win, 'touchstart', canvasMouseDown)

      win.addEventListener('touchend', canvasMouseUp, false)
      this._pushRegisteredEvents(win, 'touchend', canvasMouseUp)
    }
  }

  // async x and y from image to canvas
  _async() {
    let coordinate = this.img.getBoundingClientRect()
    this.top = coordinate.top
    this.left = coordinate.left

    this.canvas.style.cssText = `
      position: absolute;
      left: ${this.left + this.body.scrollLeft}px;
      top: ${this.top + this.body.scrollTop}px;
      use-select: none;
    `
  }

  /**
   * save binds events
   * @param  {DOM} _element  DOM that you bind event
   * @param  {String} _event  event name
   * @param  {Function} _function event function
   * @return {Boolean} true when save success
   */
  _pushRegisteredEvents(_element: Window | Node, _event: any, _function: Function) {

    this.registeredEvents.push({
      'element': _element,
      'event': _event,
      'function': _function
    })

    return true

  }

  // initial mouse shape where mouse on canvas
  _initMouse(type?: string) {
    let [body, win] = [this.body, this.win]
    let mouse = document.createElement('div')
    mouse.style.cssText = `
      display: none;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 10001;
      width: ${this.radius * 2}px;
      height: ${this.radius * 2}px;
      border: 1px solid red;
      border-radius: 100%;
    `
    this.mouse = mouse

    body.appendChild(mouse)

    let mouseMove = ((e: any) => {
      let [x, y] = [e.pageX, e.pageY]
      let isOnCanvas = this.isOnCanvas(x, y)

      mouse.style.transform = `translate(${x - this.radius}px, ${y - this.radius}px)`

      if (!isOnCanvas) {
        mouse.style.display = 'none'
        body.style.cursor = 'default'
      } else {
        mouse.style.display = 'block'
        body.style.cursor = 'none'
      }
    }).bind(this)

    // change mouse style
    if (!this.isMobile) {
      win.addEventListener('mousemove', mouseMove, false)
      this._pushRegisteredEvents(win, 'mousemove', mouseMove)
    } else {
      win.addEventListener('touchmove', mouseMove, false)
      this._pushRegisteredEvents(win, 'touchmove', mouseMove)
    }
  }

  setRadius(radius: number) {
    if (radius < 2 || radius > 100) {
      return
    }

    let mouse = this.mouse
    this.radius = radius

    mouse.style.width = radius * 2 + 'px'
    mouse.style.height = radius * 2 + 'px'
  }

  zoomIn(radius = 2) {
    this.setRadius(this.radius + radius)
  }

  zoomOut(radius = 2) {
    this.setRadius(this.radius - radius)
  }

  drawCircle(x: number, y: number, radius?: number) {
    let ctx = this.ctx
    ctx.fillStyle = this.color;
    ctx.beginPath()
    ctx.arc(x + 1, y + 1, radius || this.radius, 0, 360)
    ctx.fill()
    ctx.closePath()
  }

  drawLine(x: number, y: number, radius?: number) {
    const ctx = this.ctx

    ctx.lineCap = this.linecap
    ctx.lineJoin = 'round'
    ctx.strokeStyle = this.color
    ctx.lineWidth = (radius || this.radius) * 2
    ctx.lineTo(x, y)
    ctx.stroke()
  }


  getCoordinateByEvent(event: any) {
    let x, y
    let [doc, body] = [this.doc, this.body]
    let canvas = this.canvas

    if (this.isMobile) { event = event.changedTouches[0] }

    if (event.pageX || event.pageY) {
      x = event.pageX
      y = event.pageY
    } else {
      x = event.clientX + body.scrollLeft + doc.documentElement.scrollLeft
      y = event.clientY + body.scrollTop + doc.documentElement.scrollTop
    }

    x -= canvas.offsetLeft
    y -= canvas.offsetTop

    return [x, y]
  }

  drawByEvent(event: any): Array<any> {
    let ctx = this.ctx
    let [x, y] = this.getCoordinateByEvent(event)

    if (this.mouseType === DEFAULT_OPTIONS.PEN) {
      this.drawLine(x, y)
      return [DEFAULT_OPTIONS.PEN, this.color, x, y, this.radius]
    } else if (this.mouseType === DEFAULT_OPTIONS.ERASER) {
      x -= this.radius
      y -= this.radius
      let [w, h] = [this.radius * 2, this.radius * 2]
      ctx.clearRect(x, y, w, h)
      return [DEFAULT_OPTIONS.ERASER, x, y, w, h]
    } else {
      return []
    }
  }

  isOnCanvas(x: number, y: number, isRelative:boolean = false) {
    let body = this.body
    let scrollTop = body.scrollTop

    if (isRelative) {
      if (x < 0 || x > this.width || y < 0 || y > this.height) { return false }
      else { return true }
    } else {
      if (x < this.left || x > (this.left + this.width) || y < (scrollTop + this.top) || y > (scrollTop + this.top + this.height)) { return false }
      else { return true }
    }
  }

  setMaxWidth(width: number) {
    this.maxWidth = width
  }

  setColor(color: string) {
    this.color = color
  }

  // pen, eraser
  setTool(tool: string) {
    this.mouseType = tool

    if (tool.toLowerCase() === DEFAULT_OPTIONS.PEN) {
      this.setPen()
    } else if (tool.toLowerCase() === DEFAULT_OPTIONS.ERASER) {
      this.setEraser()
    }
  }


  setPen() {
    (Object as any).assign(this.mouse.style, {
      borderRadius: '100%',
      border: `1px solid ${DEFAULT_OPTIONS.PEN_BORDER_COLOR}`
    })

    this.mouseType = DEFAULT_OPTIONS.PEN
  }

  setEraser() {
    (Object as any).assign(this.mouse.style, {
      borderRadius: 0,
      border: `1px dashed ${DEFAULT_OPTIONS.ERASER_BORDER_COLOR}`
    })

    this.mouseType = DEFAULT_OPTIONS.ERASER
  }

  undo() {
    let ctx = this.ctx
    let color = this.color

    ctx.save()

    ctx.clearRect(0, 0, this.width, this.height)
    this.operateHistories.pop()

    this.operateHistories.map((steps: Array<any>) => {
      steps.map((step: Array<any>) => {
        if (step[0] === DEFAULT_OPTIONS.PEN) {
          this.color = step[1]
          this.drawLine(step[2], step[3], step[4])
        } else if (step[0] === DEFAULT_OPTIONS.ERASER) {
          ctx.clearRect.apply(ctx, step.slice(1))
        } else if (step[0] === 'MOVE_TO') {
          ctx.beginPath()
          ctx.moveTo.apply(ctx, step.slice(1))
        }
      })
    })

    console.log(this.operateHistories.length)

    this.color = color
    ctx.restore()
  }


  /**
   * get image origin size
   * @param  {String}   src      iamge source url
   * @param  {Function} callback callback function, width as first parameter and height as second
   * @return {undefined}
   */
  getImageOriginSize(src: string, callback?: Function) {
    let img = new Image()

    img.onload = () => {
      let width = img.width
      let height = img.height

      callback && callback(width, height)
    }

    img.src = src
  }

  getDataURL(type = 'image/jpeg', quality = 0.8, callback?: Function) {

    let src = this.img.src

    this.getImageOriginSize(src, (width: number, height: number) => {
      let tempCanvas = document.createElement('canvas')
      tempCanvas.width = width
      tempCanvas.height = height
      let tempCtx = tempCanvas.getContext('2d')
      if (tempCtx) {
        tempCtx.drawImage(this.img, 0, 0, width, height)
        tempCtx.drawImage(this.canvas, 0, 0, width, height)

        callback && callback(tempCanvas.toDataURL(type, quality))
      }
    })
  }

  /**
   * remove dom that added into body,
   * remove all events that registered
   * @return {undefined}
   */
  destroy() {
    this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas)
    this.mouse.parentNode && this.mouse.parentNode.removeChild(this.mouse)

    this.img.src = ''

    this.registeredEvents.forEach(v => {
      v.element.removeEventListener(v.event, v.function, false)
    })
    // delete this
  }
}