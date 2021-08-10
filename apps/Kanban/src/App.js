import React from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import KanbanBoard from './Components/KanbanBoard';

// const App = () => {
//     return (
//         <div>
//             <Router>
//                 <Route path="/" component={() => <KanbanBoard name="test" />} />
//             </Router>
//         </div>
//     )
// }

class App extends React.Component {
    render() {
        return (
            <div>
                <Router>
                    <Route path="/" component={() => <KanbanBoard name="test" />} />
                </Router>
            </div >
        )
    }
}

export default App;