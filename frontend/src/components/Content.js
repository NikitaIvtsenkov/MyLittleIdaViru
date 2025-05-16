// import React from 'react'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Home from '../pages/Home';
// import AddMapPage from '../pages/AddMapPage';
// import UpdateMapPage from '../pages/UpdateMapPage';

// // import ProfessionList from '../actions/ProfessionList';
// // import AddProfession from '../actions/AddProfession';
// // import EditProfession from '../actions/EditProfession';
// // import DepartmentList from '../actions/DepartmentList';
// // import AddDepartment from '../actions/AddDepartment';
// // import EditDepartment from '../actions/EditDeparment';
// // import EditProfil from '../actions/EditProfil';


// // import Register from './Register';
// import Login from './Login';

// import Logout from './Logout';

// import { jwtDecode } from 'jwt-decode';

// function Content() {
//     const [state, setState] = React.useState(false);
//     // const [role, setRole] = React.useState('');
//     React.useEffect(() => {
//         getMe();
//       }, []);
//       const getMe = async () => {
//         try {
//           const token = localStorage.getItem('token');
//           if (token) {
//             const decode = jwtDecode(token);
//             setState(true);
//           } else {
//             setState(false);
//           }
//         } catch (error) {
//            console.log(error);
//         } 
    
//       };
//     return (
//         <main className='flex-shrink-0'>
//             <Router>
//                 <Routes>
//                     <Route exact path='/' element={<Home />} />
                  
                   

//                     {state ? (
//                         <>
//                         <Route exact path='/addmappage' element={<AddMapPage />} />
//                         <Route exact path='/editplace' element={<UpdateMapPage />} />

                        
//                          {/* <Route path='/profession' element={<ProfessionList />} />
//                         <Route path='/addprofession' element={<AddProfession />} />
//                         <Route path='/editprofession/:id' element={<EditProfession />} />

//                         <Route path='/department' element={<DepartmentList />} />
//                         <Route path='/adddepartment' element={<AddDepartment />} />
//                         <Route path='/editdepartment/:id' element={<EditDepartment />} /> */}
//                         </>
//                     ) : (
//                         <></>
//                     )}

                   


//                     <Route path='/login' element={<Login />} />
//                     {/* <Route path='/register' element={<Register />} /> */}
                
//                     <Route path='/logout' element={<Logout />} />


//                 </Routes>
//             </Router>
//         </main>  
//     );
// }

// export default Content
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import MapPage from '../pages/MapPage';

import AddMapPage from '../pages/AddMapPage';
import UpdateMapPage from '../pages/UpdateMapPage';
import Login from './Login';
import Logout from './Logout';
import ProtectedRoute from './ProtectedRoute'; // Импортируем компонент для защищенных маршрутов
import { jwtDecode } from 'jwt-decode';

function Content() {
  const [state, setState] = React.useState(false);

  React.useEffect(() => {
    getMe();
  }, []);

  const getMe = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decode = jwtDecode(token);
        setState(true); // если токен валиден, значит, пользователь авторизован
      } else {
        setState(false);
      }
    } catch (error) {
      console.log(error);
      setState(false); // если токен невалиден
    }
  };

  return (
    <main className="flex-shrink-0">
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/MapPage" element={<MapPage />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* Защищенные маршруты для добавления и редактирования */}
          {state && (
            <>
              <Route
                path="/addmappage"
                element={<ProtectedRoute element={AddMapPage} />}
              />
              <Route
                path="/editplace"
                element={<ProtectedRoute element={UpdateMapPage} />}
              />
            </>
          )}
        </Routes>
      </Router>
    </main>
  );
}

export default Content;
