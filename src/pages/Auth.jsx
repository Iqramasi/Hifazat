import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import './login.css';

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const auth = getAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, form.email, form.password);
        alert("Registration successful! You can now log in.");
        setIsRegister(false);
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        alert("Login successful!");
        navigate("/map");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-outer-block">
        <div className="login-title">{isRegister ? "Register" : "Login"}</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <button type="submit">{isRegister ? "Register" : "Login"}</button>
        </form>
        <div style={{marginTop: '1rem', color: '#222'}}>
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button onClick={() => setIsRegister(false)} style={{color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 600}}>Login</button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button onClick={() => setIsRegister(true)} style={{color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 600}}>Register</button>
            </>
          )}
        </div>
        {error && <div style={{color: '#d81b60', marginTop: '1rem', fontWeight: 600}}>{error}</div>}
      </div>
    </div>
  );
}

export default Auth; 