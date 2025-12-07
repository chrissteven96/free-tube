import { createRoot } from 'react-dom/client';
import Interface from './components/interface'
import './index.css';

const App = () => {

    return (
      <>
     <Interface />
      </>
    );
    
};

const container = document.getElementById('root');
const root=  createRoot(container);
root.render(<App/>);