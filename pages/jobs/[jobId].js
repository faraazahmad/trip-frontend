import { useSession, getSession } from 'next-auth/client';
import Link from 'next/link';
import Header from '../header';
import ReactMarkdown from "react-markdown";
import { useState } from 'react';

function Job({ job, company }) {
    const [session, loading] = useSession();
    const [showModal, setShowModal] = useState(false);
    const EditLink = () => <Link href={`/companies/${company.id}/edit`}><a className="has-text-weight-bold has-text-fourth">Edit Page</a></Link>
    const ApplyDropdown = () => (
        <>
            <div class="modal is-active">
                <div class="modal-background"></div>
                <div class="modal-content">
                    <div className="box">
                        <div className="field">
                            <label className="label">What makes you stand out as a candidate? (optional)</label><br/>
                            <textarea className="textarea" type="text" placeholder="This improves your chances of getting hired"/>
                        </div>
                        <div className="buttons">
                            <button className="button is-fourth">Apply</button>
                            <button className="button">Cancel</button>
                        </div>
                    </div>
                </div>
                <button class="modal-close is-large" onClick={() => setShowModal(false)} aria-label="close"></button>
            </div>
        </>
    );

    if (typeof window !== 'undefined' && loading) return null;

    if (session) {
        return (
            <div>
                {showModal && <ApplyDropdown/>}
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
                                    <button className="button is-warning" onClick={() => setShowModal(true)}>Apply Now</button>
                                    &emsp;
                                    <span className="has-text-weight-bold">35</span>&nbsp;Applicants
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
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <h1>You need to be logged in.</h1>
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
  
    // Pass post data to the page via props
    return { props: { job, company } }
}

export default Job;