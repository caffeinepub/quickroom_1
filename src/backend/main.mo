import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Option "mo:core/Option";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import List "mo:core/List";
import VarArray "mo:core/VarArray";

actor {
  type Message = {
    sender : Text;
    text : Text;
    timestamp : Int;
  };

  type User = {
    sessionToken : Text;
    displayName : Text;
    lastActive : Int;
  };

  type Room = {
    id : Text;
    users : Map.Map<Text, User>;
    messages : List.List<Message>;
  };

  module Room {
    public func compare(room1 : Room, room2 : Room) : Order.Order {
      Text.compare(room1.id, room2.id);
    };
  };

  // Helper functions to convert room users and messages to arrays
  func getRoomUsersAsArray(room : Room) : [User] {
    room.users.values().toArray();
  };

  // Store rooms in non-stable map (not preserved across upgrades)
  let rooms = Map.empty<Text, Room>();

  // Generate unique room ID
  func generateRoomId() : Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let ranTime = Time.now();
    let charsArray : [Char] = chars.toArray();
    let idStr = Text.fromIter(
      VarArray.tabulate(
        6,
        func(i) {
          charsArray[(ranTime + i).toNat() % 62];
        }
      ).values()
    );
    idStr;
  };

  // Generate random session token
  func generateSessionToken() : Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let ranTime = Time.now();
    let charsArray : [Char] = chars.toArray();
    let token = Text.fromIter(
      VarArray.tabulate(
        16,
        func(i) {
          charsArray[(ranTime + 10 + i).toNat() % 62];
        }
      ).values()
    );
    token;
  };

  // Generate random display name
  func generateDisplayName() : Text {
    let names = ["Ghost", "Fox", "Wolf", "Bear", "Eagle"];
    let ranTime = Time.now();
    let number = ((Time.now() + 2).toNat() % 100).toText();
    names[(Time.now() + 3).toNat() % 5] # number;
  };

  func getRoom(roomId : Text) : Room {
    switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist.") };
      case (?room) { room };
    };
  };

  // Create a new room
  public shared ({ caller }) func createRoom() : async Text {
    let roomId = generateRoomId();
    let newRoom : Room = {
      id = roomId;
      users = Map.empty<Text, User>();
      messages = List.empty<Message>();
    };
    rooms.add(roomId, newRoom);
    roomId;
  };

  // Join a room
  public shared ({ caller }) func joinRoom(roomId : Text, displayName : ?Text) : async Text {
    let room = getRoom(roomId);

    let sessionToken = generateSessionToken();
    let user : User = {
      sessionToken;
      displayName = switch (displayName) {
        case (null) { generateDisplayName() };
        case (?name) { name };
      };
      lastActive = Time.now();
    };

    room.users.add(sessionToken, user);
    rooms.add(roomId, room);

    sessionToken;
  };

  // Send a message
  public shared ({ caller }) func sendMessage(roomId : Text, sessionToken : Text, messageText : Text) : async () {
    let room = getRoom(roomId);

    let userOpt = room.users.get(sessionToken);
    if (userOpt.isNull()) { Runtime.trap("User not found in room") };

    let newMessage : Message = {
      sender = userOpt.unwrap().displayName;
      text = messageText;
      timestamp = Time.now();
    };

    if (room.messages.size() >= 200) {
      ignore room.messages.removeLast();
    };
    room.messages.add(newMessage);
    rooms.add(roomId, room);
  };

  // Get all messages for a room
  public query ({ caller }) func getMessages(roomId : Text) : async [Message] {
    getRoom(roomId).messages.reverse().toArray();
  };

  // Get currently active users in a room
  public query ({ caller }) func getActiveUsers(roomId : Text) : async [User] {
    let room = getRoom(roomId);
    let activeUsersIter = getRoomUsersAsArray(room).values().filter(
      func(user) {
        Time.now() - user.lastActive < 30_000_000_000; // 30 seconds in nanoseconds
      }
    );
    activeUsersIter.toArray();
  };

  // Ping/heartbeat to mark user as active
  public shared ({ caller }) func ping(roomId : Text, sessionToken : Text) : async () {
    let room = getRoom(roomId);
    let userOpt = room.users.get(sessionToken);
    if (userOpt.isNull()) { Runtime.trap("User not found in room") };

    let activeUser = {
      sessionToken = userOpt.unwrap().sessionToken;
      displayName = userOpt.unwrap().displayName;
      lastActive = Time.now();
    };
    room.users.add(sessionToken, activeUser);
    rooms.add(roomId, room);
  };

  // Leave room
  public shared ({ caller }) func leaveRoom(roomId : Text, sessionToken : Text) : async () {
    let room = getRoom(roomId);
    room.users.remove(sessionToken);
    rooms.add(roomId, room);
  };

  // Room exists check
  public query ({ caller }) func roomExists(roomId : Text) : async Bool {
    rooms.containsKey(roomId);
  };

  // Clean up inactive users (not used in front-end)
  func cleanInactiveUsers(roomId : Text) {
    let room = getRoom(roomId);
    let activeUsers = Map.empty<Text, User>();
    let now = Time.now();
    room.users.entries().forEach(
      func((token, user)) {
        if (now - user.lastActive < 30_000_000_000) {
          activeUsers.add(token, user);
        };
      }
    );
    let updatedRoom = {
      id = room.id;
      users = activeUsers;
      messages = room.messages;
    };
    rooms.add(roomId, updatedRoom);
  };

  // Compare by last activity time
  func compareByLastActive(u1 : User, u2 : User) : Order.Order {
    Nat.compare(u2.lastActive.toNat(), u1.lastActive.toNat());
  };
};
