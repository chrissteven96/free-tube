
import { createRoot } from 'react-dom/client';
import Profile from './components/profile';

const App = () => {

    return (
      <>
        <Profile />
      </>
    );
    
};

const container = document.getElementById('root');
const root=  createRoot(container);
root.render(<App/>);