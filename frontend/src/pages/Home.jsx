import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { currentUser } = useAuth();

  // If still loading, show a simple loading state
  if (currentUser === undefined) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-blue-100">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Hotel Management System</h1>
          <p className="text-gray-600 mt-2">Streamlined management for your hotel operations</p>
        </div>
        
        <div className="space-y-4">
          {!currentUser ? (
            <>
              <Link 
                to="/login" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center shadow-md hover:shadow-lg"
              >
                Admin Login
              </Link>
              <p className="text-sm text-gray-500 text-center mt-4">
                Access the admin dashboard to manage rooms, bookings, and more.
              </p>
            </>
          ) : currentUser.role === 'admin' ? (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <p className="text-green-700 font-medium mb-2">You are logged in as Administrator</p>
              <Link 
                to="/admin" 
                className="inline-block mt-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-700 font-medium mb-2">You are logged in</p>
              <Link 
                to="/" 
                className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Return to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;