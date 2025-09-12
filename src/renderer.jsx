
import { createRoot } from 'react-dom/client';
import Interface from './components/interface'

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