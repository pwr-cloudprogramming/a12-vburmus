import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Lobby from "./components/Lobby.jsx";
import '@aws-amplify/ui-react/styles.css';
import {Authenticator} from "@aws-amplify/ui-react";

function App() {
    return (
        <Authenticator className="mt-5">
            {({ signOut, user }) => (
                <Lobby signOut={signOut} user={user}/>
            )}
        </Authenticator>
    );
}

export default App;
