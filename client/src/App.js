import { Route, Switch} from 'react-router-dom'

import './styles/index.scss';
import Navbar from './components/Navbar';
import Home from './pages';
import Discover from './pages/discover';
import Merch from './pages/merch';
import Profile from './pages/profile';

function App() {
  return (
    <>
      <Navbar/>
      <Switch>
        <Route path="/" exact component={Home}/>
        <Route path="/discover" component={Discover}/>
        <Route path="/merch" component={Merch}/>
        <Route path="/profile" component={Profile}/>
      </Switch>
    </>
  );
}

export default App;
