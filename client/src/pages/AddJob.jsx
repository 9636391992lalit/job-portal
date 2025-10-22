/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState, useContext } from 'react'
import Quill from 'quill'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { JobCategories, JobLocations,JobLevels } from '../assets/assets'
import { toast } from 'react-toastify'


const AddJob = () => {
    const [title, setTitle] = useState('')
    const [location, setLocation] = useState('Banglore')
    const [category, setCategory] = useState('Full Stack')
    const [level, setLevel] = useState('Fresher')
    const [salary, setSalary] = useState('0')
    const editorRef = useRef(null)
    const quillRef = useRef(null)
    const { backendUrl, companyToken } = useContext(AppContext)

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        try {
            const description = quillRef.current.root.innerHTML
            console.log({ title, description, location, salary, category, level });
            const { data } = await axios.post(backendUrl + '/api/company/post-job',
                { title, description, location, salary, category, level },
                { headers: { token: companyToken } }
            )
            if (data.success) {
                toast.success(data.message)
                setTitle('')
                setSalary(0)
                quillRef.current.root.innerHTML = ""

            }
            else
                toast.error(data.message)
        }
        catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(() => {
        //Initilaze the quill once
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
            })
        }

    }, [])
    return (
        <form onSubmit={onSubmitHandler} action="" className='conatiner p-4 flex flex-col w-full item-start gap-3'>
            <div className='w-full'>
                <p className='mb-2'>Job Title</p>
                <input type="text" placeholder='Type Here' onChange={e => setTitle(e.target.value)} value={title} required className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded outline-none' />
            </div>
            <div className='w-full max-w-lg'>
                <p className='my-2'> Job Description</p>
                <div ref={editorRef}> </div></div>
            <div className='flex flex-cool sm:flex-row gap-2 w-full sm:gap-8'>
                <div>
                    <p className='mb-2'>Job Category</p>
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className='w-full px-3 py-2 border-2 border-gray-300 rounded appearance-auto'
                    >
                        {JobCategories.map((cat, index) => (
                            <option value={cat} key={index}>
                                {cat}
                            </option>
                        ))}
                    </select>

                </div>
                <div>
                    <p className='mb-2'>Job Location</p>
                    <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setLocation(e.target.value)} id="">
                        {JobLocations.map((location, index) => (<option value={location} key={index}>{location}</option>))}
                    </select>
                </div>
                <div>
                    <p className='mb-2'>Job Level</p>
                    <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setLevel(e.target.value)} id="">
                        {JobLevels.map((level, index) => (<option value={level} key={index}>{level}</option>))}
                    </select>
                </div>
            </div>
            <div>
                <p className="mb-2">
                    Job Salary
                </p>
                <input className='w-full px-3 boreder-2 border-gray-300 smLw-[120px]' onChange={e => {
                    e.target.value < 0 ? setSalary(0) : setSalary(e.target.value)
                }} type="number" value={salary} placeholder='2500' />
            </div>
            <button className='w-28 py-3 mt-4 bg-black text-white rounded'>ADD</button>
        </form>
    )
}

export default AddJob
