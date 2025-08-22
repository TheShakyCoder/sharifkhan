export default class MiniMap {
  constructor(canvas) {
    this.canvas = canvas
  }
  
  draw(grid, playerPos, cubeSize, gridSize) {
    const canvas = this.canvas
    if (!canvas) return
    
    const ctx = canvas.value.getContext('2d')
    ctx.fillStyle = '#455464'
    ctx.fillRect(0, 0, 256, 256)
    
    const cellSize = 256 / 8 // 8 cubes across the minimap
    
    // Calculate player's grid position (with decimal precision for smooth scrolling)
    const playerGridX = (playerPos.x + 512) / cubeSize
    const playerGridZ = (playerPos.z + 512) / cubeSize
    
    // Calculate the visible grid range with smooth offset
    const startX = playerGridX - 4
    const endX = playerGridX + 4
    const startZ = playerGridZ - 4
    const endZ = playerGridZ + 4
    
    // Draw visible grid cells with smooth scrolling
    for (let z = Math.floor(startZ); z <= Math.ceil(endZ); z++) {
      for (let x = Math.floor(startX); x <= Math.ceil(endX); x++) {
        // Check if grid cell is within bounds
        if (x >= 0 && x < gridSize && z >= 0 && z < gridSize) {
          const idx = z * gridSize + x
          if (grid[idx] === 1) {
            ctx.fillStyle = 'red'
            // Calculate smooth position with fractional offset
            const drawX = (x - startX) * cellSize
            const drawY = (z - startZ) * cellSize
            ctx.fillRect(drawX, drawY, cellSize, cellSize)
          }
        }
        
        // Draw grid coordinates
        // ctx.fillStyle = 'black'
        // ctx.font = '10px Arial'
        // ctx.textAlign = 'center'
        // const drawX = (x - startX) * cellSize + cellSize/2
        // const drawY = (z - startZ) * cellSize + cellSize/2
        // ctx.fillText(`${x},${z}`, drawX, drawY)
      }
    }
    
    // Player position (always at center) - use consistent coordinate system
    const playerMinimapX = 128
    const playerMinimapY = 128
    
    ctx.fillStyle = 'white'
    ctx.fillRect(playerMinimapX - 2, playerMinimapY - 2, 4, 4)
    
    // Draw arrow from player towards player's facing direction
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(playerMinimapX, playerMinimapY)
    
    const arrowLength = 10
    const arrowEndX = playerMinimapX - Math.sin(playerPos.angle) * arrowLength
    const arrowEndY = playerMinimapY - Math.cos(playerPos.angle) * arrowLength
    
    ctx.lineTo(arrowEndX, arrowEndY)
    ctx.stroke()
    
    // Arrow head
    // ctx.beginPath()
    // ctx.moveTo(arrowEndX, arrowEndY)
    // ctx.lineTo(arrowEndX - Math.cos(playerPos.angle) * 4 - Math.sin(playerPos.angle) * 4, 
    //            arrowEndY + Math.sin(playerPos.angle) * 4 - Math.cos(playerPos.angle) * 4)
    // ctx.moveTo(arrowEndX, arrowEndY)
    // ctx.lineTo(arrowEndX + Math.cos(playerPos.angle) * 4 - Math.sin(playerPos.angle) * 4, 
    //            arrowEndY - Math.sin(playerPos.angle) * 4 - Math.cos(playerPos.angle) * 4)
    // ctx.stroke()
  }
}