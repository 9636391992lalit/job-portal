import React, { useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets'
const AddJob = () => {
    const [title, setTitle] = useState('')
    const [location, setLocation] = useState('Banglore')
    const [category, setCategory] = useState('Full Stack')
    const [level, setLevel] = useState('Fresher')
    const [salary, setSalary] = useState('0')
    const editorRef = useRef(null)
    const quillRef = useRef(null)
    useEffect(() => {
        //Initilaze the quill once
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
            })
        }

    }, [])
    return (
        <form action="" className='conatiner p-4 flex flex-col w-full item-start gap-3'>
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
                    <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setCategory(e.target.value)} id="">
                        {JobCategories.map((category, index) => (<option value={category} key={index}>{category}</option>))}
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
                        <option value="Fresher level">Fresher level</option>
                        <option value="Intermidiate level">Intermediate level</option>
                        <option value="Seniour level">Fresher level</option>
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
