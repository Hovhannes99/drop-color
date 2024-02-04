import React from 'react';
import ColorDropper from './ColorDropperProps';
import photo from './photo.jpg'
import Magnifier from './ColorDropperProps';

function App() {
    return (
      <div className="App">
      <header className="App-header">
        <Magnifier src={photo} />
      </header>
    </div>
    );
}

export default App;
