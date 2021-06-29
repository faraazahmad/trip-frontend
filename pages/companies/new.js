import { useSession } from 'next-auth/client'
import Link from 'next/link'
import { useEffect, useState } from 'react';
import Header from '../header'

function CompaniesNew() {
    const [session, loading] = useSession();
    const [name, setName] = useState();
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (session) {
            setName(`${session.user.username}'s new company`)
        }
    },[session]);
    
    if (typeof window !== 'undefined' && loading) return null;

    const createCompany = async () => {
        const res = await fetch(process.env.API_URL + '/organisation/new/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.tokens.access}`
            },
            body: JSON.stringify({name, owner: session.user.id})
        });
        const data = await res.json();
        if (res.status !== 201) {
            setErrors(data);
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

    if (session) {
        return (
            <>
                <Header/>
                <section className="hero is-fullheight-with-navbar is-first">
                    <div className="container hero-body">
                        <div className="columns is-vcentered">
                            <div className="column">
                                <p className="subtitle">Create a</p>
                                <p className="title is-size-1 styled">new org</p>
                                <br/>
                                <div className="box auth">
                                    <div className="field">
                                        {JSON.stringify(errors) !== '{}' && errorMessage()}
                                        <label className="label">Name</label>
                                        <div className="control">
                                            <input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="input"
                                                type="text"
                                                placeholder="e.g: Contoso Tech"
                                            />
                                        </div>
                                        <p class="help">You can change it later</p>
                                    </div>
                                    <br/>
                                    <div className="field is-grouped">
                                        <div className="control">
                                            <button onClick={() => createCompany()} className="button is-fourth">Create</button>
                                        </div>
                                        <div className="control">
                                            <button className="button is-light">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </>
        )
    }

    return (
        <>
            <Header/>
            <section className="hero">
                <div className="hero-body">
                    <p className="title">You need to be logged in</p>
                </div>
            </section>
        </>
    )
}

export default CompaniesNew