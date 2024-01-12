import { useState } from "react";
import { CreateNewSessionCard } from "./components/CreateNewSessionCard";
import { LiveLocalSessionCard } from "./components/LiveLocalSessionCard";
import "./index.scss";

export const LiveLocalIndex = () => {
  const [sessions, setSessions] = useState([]);

  const handleNewSessionCreation = (port) => {
    setSessions((prevSessions) => [
      ...prevSessions,
      //   TODO: add correct session url, added dummy for now
      { port, url: `http://localhost:${port}`, status: "running", startTime: Date.now() },
    ]);
  };

  const handleSessionDeletion = (port) => {
    console.log("port", port);
    setSessions((prevSessions) => prevSessions.filter((session) => session.port !== port));
  };

  return (
    <div className="live-local-index-wrapper">
      <div className="live-local-index-card live-local-sessions-card-wrapper">
        {sessions.length
          ? sessions.map((session) => (
              <LiveLocalSessionCard key={session.port} session={session} clearSessionCallback={handleSessionDeletion} />
            ))
          : null}
        <CreateNewSessionCard sessions={sessions} createNewSesionCallback={handleNewSessionCreation} />
      </div>
      <div className="live-local-index-card session-traffice-table">TODO: ADD COMING SOON FOR TRAFFIC TABLE HERE</div>
    </div>
  );
};
