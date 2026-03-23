const { spawn } = require('child_process');
const server = spawn('node', ['server.js'], { stdio: 'inherit' });

setTimeout(() => {
    console.log('Server seemingly healthy after 5s');
    server.kill();
    process.exit(0);
}, 5000);

server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

server.on('close', (code) => {
    if (code !== 0 && code !== null) {
        console.log(`Server process exited with code ${code}`);
        process.exit(code);
    }
});
