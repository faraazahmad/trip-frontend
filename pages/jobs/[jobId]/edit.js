import { getSession } from 'next-auth/client';
import Link from 'next/link';
import Header from '../../header';
import Select from 'react-select'
import { useRouter } from 'next/router';
import { useState } from 'react';

function Job({ job, company, applications, session, problemSets, problems }) {
    const [title, setTitle] = useState(job.title);
    const [description, setDescription] = useState(job.description);
    const [errors, setErrors] = useState({});

    const defaultProblems = problems.filter(p => problemSets.indexOf(p.id) !== -1).map(p => ({value: p.id, label: p.title}));
    const [selected, setSelected] = useState(defaultProblems);

    const router = useRouter();

    const updateJob = async () => {
        const selectedString = selected.map(prob => prob.value).join();
        const res = await fetch(`http://localhost:8000/api/job/${job.id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.tokens.access}`
            },
            body: JSON.stringify({title, description, problem_sets: selectedString})
        });
        
        if (res.status !== 200) {
            const data = await res.json();
            setErrors(data);
        } else {
            router.push(`/jobs/${job.id}`);
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

    if (session && company.admin === session.user.id) {
        return (
            <div>
                <Header/>
                <section className="hero container is-small is-cream is-jumbo">
                    <div className="hero-body">
                        <div className="columns is-vcentered">
                            <div className="column has-text-left">
                                <p className="title">Edit Job Profile</p>
                            </div>
                            <div className="column is-one-quarter">
                            </div>
                        </div>
                    </div>
                </section>
                <br/>
                <div className="container">
                    {JSON.stringify(errors) !== '{}' && errorMessage()}
                    <div className="field">
                        <label className="label">Title</label>
                        <input
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                            placeholder="eg: Junior Software Engineer"
                        />
                    </div>
                    <div className="field">
                        <label className="label">Description</label>
                        <textarea
                            className="textarea"
                            value={description}
                            rows={25}
                            onChange={(e) => setDescription(e.target.value)}
                            type="text"
                            placeholder="A precise description of the job"
                        />
                    </div>
                    <br/>
                    <div>
                        <h1 className="subtitle">Select Problem sets</h1>
                        <Select
                            value={selected}
                            isMulti
                            options={problems.map(p => ({value: p.id, label: p.title}))}
                            onChange={(selectedOptions) => setSelected(selectedOptions)}
                        />
                    </div>
                    <br/>
                    <div className="buttons">
                        <button className="button is-fourth" onClick={updateJob}>Save</button>
                        <button className="button" onClick={() => router.push(`/jobs/${job.id}`)}>Cancel</button>
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
    const res = await fetch(process.env.API_URL + '/organisations/', {
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

    const jobRes = await fetch(process.env.API_URL + `/job/${context.params.jobId}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const job = await jobRes.json();

    const companyRes = await fetch(process.env.API_URL + `/organisation/${job.organisation}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const company = await companyRes.json();

    const applicationRes = await fetch(process.env.API_URL + `/applications/?job=${job.id}`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const applications = await applicationRes.json();

    const problemsRes = await fetch(process.env.API_URL + `/problems/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    });
    const problems = await problemsRes.json();

    const problemSets = job.problem_sets.split(',').map(set => parseInt(set));
  
    // Pass post data to the page via props
    return { props: { job, company, applications, session, problemSets, problems } }
}

export default Job;