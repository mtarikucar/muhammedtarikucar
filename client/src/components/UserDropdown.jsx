import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { FiSettings } from 'react-icons/fi';

import { useDispatch } from 'react-redux';
import { logoutSuccess } from '../store/AuthSlice';
function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}


function UserDropdown({ setIsOpen }) {

    const dispach = useDispatch()

    /*   const [isOpen ,setIsOpen]=useState(false) */
    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex w-full text-center justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    <FiSettings />
                    <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => setIsOpen(true)}
                                    className={classNames(
                                        active ? 'bg-gray-100 w-full text-gray-900' : 'text-gray-700 w-full',
                                        'block px-4 py-2 text-sm'
                                    )}
                                >
                                    Update
                                </button>
                            )}
                        </Menu.Item>
                       
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={()=> dispach(logoutSuccess)}
                                    className={classNames(
                                        active ? 'bg-gray-100 w-full text-red-600' : 'text-red-600 w-full',
                                        'block w-full px-4 py-2  text-sm'
                                    )}
                                >
                                    Log out
                                </button>
                            )}
                        </Menu.Item>
                       {/*  <form method="POST" action="#">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={dispach(logoutSuccess)}
                                        type="submit"
                                        className={classNames(
                                            active ? 'bg-gray-100 text-red-600' : 'text-red-600',
                                            'block w-full px-4 py-2 text-left text-sm'
                                        )}
                                    >
                                        Log out
                                    </button>
                                )}
                            </Menu.Item>
                        </form> */}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}

export default UserDropdown