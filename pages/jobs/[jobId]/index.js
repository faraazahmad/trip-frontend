import { getSession } from 'next-auth/client';
import Link from 'next/link';
import Header from '../../header';
import ReactMarkdown from "react-markdown";
import { useState } from 'react';

function Job({ job, company, applications, session }) {
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    const [applied, setApplied] = useState(applications.find(app => app.user === session.user.id) !== undefined);

    const applyToJob = async () => {
        const res = await fetch('http://localhost:8000/api/application/new/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.tokens.access}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({job: job.id, user: session.user.id, message})
        });

        if (res.status === 201) {
            setApplied(true);
            setMessage('');
            setShowModal(false);
        } else {
            const errors = await res.json();
            console.log(errors);
        }
    }

    const EditLink = () => <Link href={`/jobs/${job.id}/edit`}><a className="has-text-weight-bold has-text-fourth">Edit Job Profile</a></Link>

    if (session) {
        return (
            <div>
                {showModal && 
                <div className="modal is-active">
                    <div className="modal-background"></div>
                    <div className="modal-content">
                        <div className="box">
                            <div className="field">
                                <label className="label">What makes you stand out as a candidate? (optional)</label><br/>
                                <textarea
                                    key="message"
                                    value={message}
                                    className="textarea"
                                    type="text"
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="This improves your chances of getting hired"
                                />
                            </div>
                            <div className="buttons">
                                <button className="button is-fourth" onClick={() => applyToJob()}>Apply</button>
                                <button className="button" onClick={() => setShowModal(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                    <button className="modal-close is-large" onClick={() => setShowModal(false)} aria-label="close"></button>
                </div>}
                <Header/>
                <section className="hero container is-second is-jumbo">
                    <div className="hero-body">
                        <div className="columns is-vcentered">
                            <div className="column has-text-left">
                                {company.admin === session.user.id && <p className="subtitle "><EditLink/></p>}
                                <p className="title is-size-1">{job.title}</p>
                                <p className="subtitle"><Link href={`/companies/${job.organisation}`}><a className="has-text-cream">{company.name}</a></Link></p>
                                <br/>
                                <p className="has-text-cream">
                                    {!applied && <button className="button is-warning" onClick={() => setShowModal(true)}>Apply Now</button>}
                                    {applied && <button className="button is-warning " disabled>Applied</button>}
                                    &emsp;
                                    <span className="has-text-weight-bold">{applications.length}</span>&nbsp;Applicants
                                </p>
                                
                            </div>
                            <div className="column is-one-quarter">
                                <p className="subtitle">Compensation</p>
                                <p className="title">${job.compensation_pa/1000}k</p>
                                <br/>
                                <p className="subtitle">Equity</p>
                                <p className="title">{job.equity}%</p>
                            </div>
                        </div>
                    </div>
                </section>
                <br/><br/>
                <div className="container">
                    <div className="columns">
                        <div className="column">
                            <p className="content"><ReactMarkdown>{job.description}</ReactMarkdown></p>
                        </div>
                        <div className="column is-one-third jobs-sidebar">
                            {session.user.id === company.admin && <Link href={`/jobs/${job.id}/dashboard`}><a className="button is-fullwidth">Go to Job dashboard</a></Link>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <Header/>
            <h1>You need to be logged in.</h1>
        </>
    )
}

export async function getServerSidePaths(context) {
    const session = await getSession(context);
    const res = await fetch('http://localhost:8000/api/organisations/', {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    });
    const companies = await res.json();

    const paths = companies.map((company) => ({
        params: { id: `${company.id}` }
    }));

    return { paths, fallback: false };
}

export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session) {
        return { props: {} };
    }

    const jobRes = await fetch(`http://localhost:8000/api/job/${context.params.jobId}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const job = await jobRes.json();

    const companyRes = await fetch(`http://localhost:8000/api/organisation/${job.organisation}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const company = await companyRes.json();

    const applicationRes = await fetch(`http://localhost:8000/api/applications/?job=${job.id}`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const applications = await applicationRes.json();
  
    // Pass post data to the page via props
    return { props: { job, company, applications, session } }
}

export default Job;