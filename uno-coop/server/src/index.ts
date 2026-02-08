import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

io.on("connection", socket => {
  console.log("connected:", socket.id);
});

httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});