import React, { useState } from 'react';
import { googleLogin, emailSignUp, emailLogin } from './auth';

const AuthUI = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleLogin = async () => {
    await googleLogin();
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    await emailSignUp(email, password, name);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    await emailLogin(email, password);
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <form onSubmit={handleEmailLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>

      <h2>Sign Up</h2>
      <form onSubmit={handleEmailSignUp}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default AuthUI;
