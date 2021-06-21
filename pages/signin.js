import { useState, useEffect } from 'react';
import { signin, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from './header';

export default function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('') ;
    const router = useRouter();
    const [session, loading] = useSession();

    
    useEffect(() => {
        if (session) {
            return router.push('/');
        }
    });

    return <>
        <Header/>
        <section className="hero is-fullheight-with-navbar is-warning">
            <div className="container hero-body">
                <div className="columns is-vcentered">
                    <div className="column">
                        <p className="title is-size-1 styled">Sign In</p>
                        <p className="subtitle">to your account</p>
                        <br/>
                        <div className="card auth-card">
                            <div className="card-content">
                                <div className="content">
                                    <div className="field">
                                        <label className="label">Username</label>
                                        <input onChange={(e) => setUsername(e.target.value)} className="input" type="text" placeholder="e.g: stevejobs" />
                                    </div>

                                    <div className="field">
                                        <label className="label">Password</label>
                                        <input onChange={(e) => setPassword(e.target.value)} className="input" type="password" placeholder="e.g: n0obM@ster78" />
                                    </div>
                                    <br/>
                                    <div className="field is-grouped">
                                        <div className="control">
                                            <button onClick={() => signin('credentials', { username, password })} className="button is-link">Sign in</button>
                                        </div>
                                        <div className="control">
                                            <button className="button is-light">Cancel</button>
                                        </div>
                                    </div>
                                    <hr/>
                                    <p>Don't have an account? <Link href="/signup"><a className="has-text-link">Sign Up</a></Link></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </>
}