class CanvasRenderer {
  constructor(w, h) {
    const canvas = document.createElement("canvas")
    this.w = canvas.width = w
    this.h = canvas.height = h
    this.view = canvas
    this.ctx = canvas.getContext("2d")
    this.ctx.textBaseline = "top" // Render from top-left
  }

  render(container, clear = true) {
    const {
      ctx
    } = this

    function renderRec(container) {
      // Render the container children
      container.children.forEach(child => {
        if (child.visible === false) return
        ctx.save()
        // Draw the leaf node
        if (child.pos) {
          ctx.translate(Math.round(child.pos.x), Math.round(child.pos.y))
        }

        if (child.anchor) {
          ctx.translate(child.anchor.x, child.anchor.y)
        }

        if (child.rotation) {
          const { x, y } = child.pivot ? child.pivot : { x: 0, y: 0 }
          ctx.translate(x, y)
          ctx.rotate(child.rotation)
          ctx.translate(-x, -y)
        }

        if (child.scale) {
          ctx.scale(child.scale.x, child.scale.y)
        }

        if (child.text) {
          const { font, fill, align } = child.style
          if (font) ctx.font = font
          if (fill) ctx.fillStyle = fill
          if (align) ctx.textAlign = align
          ctx.fillText(child.text, 0, 0)
        } else if (child.texture) {
          const img = child.texture.img
          if (child.tileW) {
            ctx.drawImage(
              img,
              child.frame.x * child.tileW, // source x
              child.frame.y * child.tileH, // source y
              child.tileW,
              child.tileH,
              0,
              0,
              child.tileW,
              child.tileH
            )
          } else {
            let { texture, pos } = child
            ctx.drawImage(texture.img, 0, 0)
          }
        } else if (child.style && child.w && child.h) {
          ctx.fillStyle = child.style.fill
          ctx.fillRect(0, 0, child.w, child.h)
        } else if (child.path) {
          const [head, ...tail] = child.path
          if (child.path.length > 1) {
            ctx.fillStyle = child.style.fill || 'hsl(0, 100%, 100%)'
            ctx.beginPath()
            ctx.moveTo(head.x, head.y)
            tail.forEach(({
              x,
              y
            }) => ctx.lineTo(x, y))
            ctx.closePath()
            ctx.fill()
          }
        }

        // Handle the child types
        if (child.children) {
          renderRec(child)
        }
        ctx.restore()
      })
    }
    if (clear) ctx.clearRect(0, 0, this.w, this.h)
    renderRec(container)
  }
}

export default CanvasRenderer