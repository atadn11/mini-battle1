const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: 'arcade' },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, others = {}, cursors, socket;

function preload() {
    this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
}

function create() {
    // اتصال به سرور
    socket = io();
    
    // ایجاد بازیکن
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);
    
    // کنترل‌ها
    cursors = this.input.keyboard.createCursorKeys();
    
    // مدیریت بازیکنان دیگر
    socket.on('players', (players) => {
        Object.entries(players).forEach(([id, data]) => {
            if (id !== socket.id && !others[id]) {
                others[id] = this.add.sprite(data.x, data.y, 'player');
            }
        });
    });
    
    socket.on('playerMoved', ({id, x, y}) => {
        if (others[id]) others[id].setPosition(x, y);
    });
    
    socket.on('playerLeft', (id) => {
        if (others[id]) others[id].destroy();
    });
}

function update() {
    if (cursors.left.isDown) player.x -= 3;
    if (cursors.right.isDown) player.x += 3;
    if (cursors.up.isDown) player.y -= 3;
    if (cursors.down.isDown) player.y += 3;
    
    if (socket) socket.emit('move', {x: player.x, y: player.y});
}
