// import React, { useState, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import { Link } from 'react-router-dom';

// const Register = () => {
//     const { handleRegister } = useContext(AuthContext);
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [role, setRole] = useState('employee');

//     const onSubmit = async (e) => {
//         e.preventDefault();
//         await handleRegister({ name, email, password, role });
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100">
//             <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
//                 <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
//                 <form onSubmit={onSubmit} className="space-y-6">
//                     <div>
//                         <label className="block mb-2 text-sm font-medium text-gray-700">Name</label>
//                         <input 
//                             type="text" 
//                             value={name} 
//                             onChange={(e) => setName(e.target.value)} 
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
//                             required 
//                         />
//                     </div>
//                     <div>
//                         <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
//                         <input 
//                             type="email" 
//                             value={email} 
//                             onChange={(e) => setEmail(e.target.value)} 
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
//                             required 
//                         />
//                     </div>
//                     <div>
//                         <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
//                         <input 
//                             type="password" 
//                             value={password} 
//                             onChange={(e) => setPassword(e.target.value)} 
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
//                             required 
//                         />
//                     </div>
//                     <div>
//                         <label className="block mb-2 text-sm font-medium text-gray-700">Role</label>
//                         <select 
//                             value={role} 
//                             onChange={(e) => setRole(e.target.value)} 
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
//                         >
//                             <option value="employee">Employee</option>
//                             <option value="admin">Admin</option>
//                         </select>
//                     </div>
//                     <button 
//                         type="submit" 
//                         className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//                     >
//                         Register
//                     </button>
//                 </form>
//                 <div className="mt-4 text-center">
//                     <p className="text-sm">Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link></p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Register;
