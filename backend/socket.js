const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: [ 'GET', 'POST' ]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);


        socket.on('join', async (data) => {
            const { userId, userType } = data;

            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
            } else if (userType === 'captain') {
                await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
            }
        });


        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;
            console.log(`[SOCKET] Received location update from driver ${userId}:`, location);

            if (!location || !location.ltd || !location.lng) {
                return socket.emit('error', { message: 'Invalid location data' });
            }

            // Update captain's location in database
            await captainModel.findByIdAndUpdate(userId, {
                location: {
                    ltd: location.ltd,
                    lng: location.lng
                }
            });

            // Find active rides for this captain and emit to tourists
            const Ride = require('./models/ride.model');
            console.log(`[SOCKET] Finding active rides for driver ${userId}...`);
            
            // Try multiple ride status values
            const activeRides = await Ride.find({ 
                captain: userId, 
                status: { $in: ['accepted', 'ongoing', 'started', 'confirmed'] } 
            }).populate('user');

            console.log(`[SOCKET] Found ${activeRides.length} active rides for driver ${userId}`);
            
            // Log details of each ride
            activeRides.forEach((ride, index) => {
              console.log(`[SOCKET] Ride ${index + 1}:`, {
                rideId: ride._id,
                status: ride.status,
                captain: ride.captain,
                user: ride.user?._id,
                userSocketId: ride.user?.socketId
              });
            });

            // Emit location update to all tourists with active rides
            let forwardedCount = 0;
            activeRides.forEach(ride => {
                if (ride.user && ride.user.socketId) {
                    const locationData = {
                        rideId: ride._id,
                        lat: location.ltd,
                        lng: location.lng,
                        eta: '5 min', // You can calculate actual ETA based on distance
                        timestamp: new Date().toISOString()
                    };
                    
                    io.to(ride.user.socketId).emit('driver-location-update', locationData);
                    console.log(`[SOCKET] Sent location update to tourist ${ride.user._id} for ride ${ride._id}`);
                    console.log(`[SOCKET] Location data:`, locationData);
                    forwardedCount++;
                } else {
                    console.log(`[SOCKET] No socket ID for user in ride ${ride._id}`);
                }
            });
            
            console.log(`[SOCKET] Forwarded location to ${forwardedCount} tourists`);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {

console.log(messageObject);

    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };