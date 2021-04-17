import { Route, Switch} from 'react-router-dom'

import './styles/index.scss';
import Navbar from './components/Navbar';
import Home from './pages';
import Discover from './pages/discover';
import Merch from './pages/merch';
import Profile from './pages/profile';
import { useEffect, useMemo, useState } from 'react';
import { UserContext } from './UserContext';
import Signin from './pages/signin';

function App() {
  const [user,setUser] = useState(null);

  const value = useMemo(()=> ({user,setUser}), [user,setUser]);

  useEffect(()=>{
    (
        async () => {
            const response = await fetch('http://localhost:8000/api/user', {
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
            })

            const content = await response.json();

            if(content._id){
                setUser(content);
            }

        }
    )()
  }, [])
  return (
    <UserContext.Provider value={value}>
      <Navbar/>
      <Switch>
        <Route path="/" exact component={Home}/>
        <Route path="/discover" component={Discover}/>
        <Route path="/merch" component={Merch}/>
        <Route path="/signin" component={Signin}/>
        <Route path="/profile" component={Profile}/>
      </Switch>
    </UserContext.Provider>
  );
}

export default App;
