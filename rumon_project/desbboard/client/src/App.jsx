
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import {
  FaUsers,
  FaChartBar,
  FaUserTie,
  FaCog,
  FaRegCalendarAlt,
  FaBriefcase,
  FaFileAlt,
  FaTrash,
  FaEdit,
  FaTimes,
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const App = () => {

  const [showModal, setShowModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [employees, setEmployees] = useState([])
const [search, setSearch] = useState('')
  const navigate = useNavigate()

  // const [employees, setEmployees] = useState([
  //   {
  //     id: 1,
  //     name: 'Sarah Johnson',
  //     email: 'sarah.j@company.com',
  //     title: 'Senior HR Manager',
  //     role: 'HR Manager',
  //   },
  // ])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddUser = async () => {

    const newUser = {
      name: formData.name,
      email: formData.email,
      title: formData.title,
      role: selectedRole,
    }

    await axios.post(
      'http://localhost:5000/employees',
      newUser
    )

    fetchEmployees()

    setFormData({
      name: '',
      email: '',
      title: '',
    })

    setSelectedRole('')
    setShowModal(false)
}

  const roles = [
    'Super Admin',
    'HR Manager',
    'Recruiter',
    'Interviewer',
    'Viewer',
  ]

  const handleClick = () =>{
    navigate('/jobposting')
  }

  const fetchEmployees = async () => {

    const res = await axios.get(
      'http://localhost:5000/employees'
    )

    setEmployees(res.data)
}

useEffect(() => {
    fetchEmployees()
}, [])


  return (
    <div className='flex min-h-screen bg-[#f4f4f7]'>

      {/* Sidebar */}
      <div className='w-[260px] bg-white shadow-sm p-5'>

        <div className='flex items-center gap-2 mb-10'>
          <div className='w-10 h-10 bg-purple-600 rounded-full'></div>
          <h1 className='font-bold text-2xl'>HIREMATE</h1>
        </div>

        <div className='space-y-3'>

          <button className='w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-purple-600 hover:text-white transition'>
            <FaChartBar /> Dashboard
          </button>

          <button className='w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-purple-600 hover:text-white transition'>
            <FaChartBar /> Report
          </button>

          <button className='w-full flex items-center gap-3 p-3 rounded-xl bg-purple-600 text-white'>
            <FaUsers /> Employees
          </button>

          <button onClick={handleClick} className='w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-purple-600 hover:text-white transition'>
            <FaBriefcase /> Job Posting
          </button>

          <button className='w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-purple-600 hover:text-white transition'>
            <FaUserTie /> Candidate
          </button>

          <button className='w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-purple-600 hover:text-white transition'>
            <FaRegCalendarAlt /> Calendar
          </button>

          <button className='w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-purple-600 hover:text-white transition'>
            <FaFileAlt /> Resume Parsing
          </button>

          <button  className='w-full flex items-center gap-3 p-3 rounded-xl text-gray-600 hover:bg-purple-600 hover:text-white transition'>
            <FaCog /> Setting
          </button>

        </div>

      </div>

      {/* Main */}
      <div className='flex-1 p-8'>

        {/* Header */}
        <div className='flex justify-between items-center mb-8'>

          <div>
            <h1 className='text-3xl font-bold text-gray-800'>Employee & User Management</h1>
            <p className='text-gray-500 mt-1'>Manage access control and internal staff status</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl'
          >
            Add User
          </button>

        </div>

        {/* Cards */}
        <div className='grid grid-cols-5 gap-5 mb-8'>

          {roles.map((role, index) => (
            <div key={index} className='bg-white rounded-2xl p-5 shadow-sm'>
              <h2 className='font-bold text-lg'>{role}</h2>
              <p className='text-gray-500 mt-2'>Users</p>
            </div>
          ))}

        </div>

        {/* Table */} 
        <div className='bg-white rounded-2xl shadow-sm p-6'>  

          <div className='flex justify-between items-center mb-5'>
            <h2 className='text-2xl font-bold'>Employee Status</h2>

            <input 
              type='text'
              placeholder='Search employees...'
              className='border border-gray-300 px-4 py-2 rounded-xl outline-none'
            />
          </div>

          <table className='w-full'>

            <thead>
              <tr className='text-left text-gray-500 border-b'>
                <th className='py-4'>Employee Name</th>
                <th>Email</th>
                <th>Job Title</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {employees.map((employee) => (

                <tr key={employee._id} className='border-b'>

                  <td className='py-5 font-medium'>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.title}</td>
                  <td>{employee.role}</td>

                  <td>
                    <div className='flex gap-3'>
                      <FaEdit className='cursor-pointer text-gray-500' />
                      <FaTrash className='cursor-pointer text-red-500' />
                    </div>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* Modal */}
      {
        showModal && (
          <div className='fixed inset-0 bg-black/40 flex justify-center items-center z-50'>

            <div className='bg-white w-[500px] rounded-3xl p-7'>

              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold'>Add User</h2>

                <FaTimes
                  onClick={() => setShowModal(false)}
                  className='cursor-pointer text-gray-500'
                />
              </div>

              {/* Roles */}
              <div className='grid grid-cols-2 gap-4 mb-6'>

                {roles.map((role, index) => (

                  <button
                    key={index}
                    onClick={() => setSelectedRole(role)}
                    className={`border p-4 rounded-2xl font-medium transition ${
                      selectedRole === role
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'hover:border-purple-500'
                    }`}
                  >
                    {role}
                  </button>

                ))}

              </div>

              {
                selectedRole && (

                  <div className='space-y-4'>

                    <input
                      type='text'
                      name='name'
                      placeholder='Employee Name'
                      value={formData.name}
                      onChange={handleChange}
                      className='w-full border border-gray-300 px-4 py-3 rounded-xl outline-none'
                    />

                    <input
                      type='email'
                      name='email'
                      placeholder='Email'
                      value={formData.email}
                      onChange={handleChange}
                      className='w-full border border-gray-300 px-4 py-3 rounded-xl outline-none'
                    />

                    <input
                      type='text'
                      name='title'
                      placeholder='Job Title'
                      value={formData.title}
                      onChange={handleChange}
                      className='w-full border border-gray-300 px-4 py-3 rounded-xl outline-none'
                    />

                    <input
                      type='text'
                      value={selectedRole}
                      disabled
                      className='w-full border border-gray-300 px-4 py-3 rounded-xl bg-gray-100 outline-none'
                    />

                    <button
                      onClick={handleAddUser}
                      className='w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium'
                    >
                      Add Employee
                    </button>

                  </div>

                )
              }

            </div>

          </div>
        )
      }

    </div>
  )
}

export default App

