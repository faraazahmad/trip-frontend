
import Link from 'next/link';
import { useState } from 'react';
import Header from './header';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});

    const createUser = async () => {
        const resp = await fetch('http://localhost:8000/api/users/register/', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({username, password, email})
        });

        if (resp.status !== 201) {
            const err = await resp.json();
            setErrors(err);
        }
    }

    const errorMessage = () => {
        return (
            <article class="message is-danger">
                <div class="message-header">
                    <p>There were errors</p>
                </div>
                <div class="message-body">
                    {Object.entries(errors).map(([key, value]) => <p><strong>{key}</strong>: {value}</p>)}
                </div>
            </article>
        )
    }

    return <>
        <Header/>
        <section className="hero is-fullheight-with-navbar is-link">
            <div className="container hero-body">
                <div className="columns is-vcentered">
                    <div className="column">
                        <p className="title is-size-1 styled">Sign Up</p>
                        <p className="subtitle">for your new account</p>
                        <br/>
                        <div className="card auth-card">
                            <div className="card-content">
                                <div className="content">
                                    {JSON.stringify(errors) !== '{}' && errorMessage()}
                                    <div className="field">
                                        <label className="label">Username</label>
                                        <input onChange={(e) => setUsername(e.target.value)} className="input" type="text" placeholder="e.g: stevejobs" />
                                    </div>
                                    <div className="field">
                                        <label className="label">Email</label>
                                        <input onChange={(e) => setEmail(e.target.value)} className="input" type="email" placeholder="e.g: steve@pear.com" />
                                    </div>
                                    <div className="field">
                                        <label className="label">Password</label>
                                        <input onChange={(e) => setPassword(e.target.value)} className="input" type="password" placeholder="e.g: n0obM@ster78" />
                                    </div>
                                    <br/>
                                    <div className="field is-grouped">
                                        <div className="control">
                                            <button className="button is-warning" onClick={() => createUser()}>Signup</button>
                                        </div>
                                        <div className="control">
                                            <button className="button is-light">Cancel</button>
                                        </div>
                                    </div>
                                    <hr/>
                                    <p>Already have an account? <Link href="/signin"><a className="has-text-link">Sign In</a></Link></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>
}