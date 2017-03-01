//import React from 'react';
//import ReactDOM from 'react-dom';

// function Foo(options)
// {
//     return <div>"Lollllll" + {options.name}</div>
// }

class Foo extends React.Component
{
    render()
    {
        return <div>2515151{this.props.name}</div>
    }
}


setInterval( () => {
   ReactDOM.render(
       <Foo name={new Date().toLocaleTimeString()}></Foo>,
       document.getElementById('root')   
   )
}, 2000);

// ReactDOM.render(
//     <div>
//         <Foo name="Lol" />
//         <Foo name = "Omg" />
//     </div>,     
//     document.getElementById('root')
// );
