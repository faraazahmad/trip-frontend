import { useSession, getSession } from 'next-auth/client';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import Header from '../header'

function Problem({ problem, submissions, tech, session }) {
    const getTagStatusClass = (submission) => {
        switch (submission.status) {
            case "Passed": return "is-success";
            case "Failed": return "is-danger";
            default      : return "is-warning";
        }
    }

    const downloadFiles = async () => {
        const res = await fetch(`http://localhost:8000/api/problem/${problem.id}/download/`, {
            headers: {
                'Authorization': `Bearer ${session.tokens.access}`
            }
        })
        const downloadLink = await res.json();
        window.open(downloadLink);
    }

    const submissionsList = submissions.map(sub => (
        <li className="submission-list-item">
            <Link href={`/submissions/${sub.id}`}>
                <a className="columns">
                    <span className="column has-text-weight-bold">#{sub.id}</span>
                    <span className="column has-text-grey has-text-right">
                        <span className={`tag ${getTagStatusClass(sub)} is-light`}>{sub.status}</span></span>
                </a>
            </Link>
        </li>
    ))

    if (session) {
        return (
            <div>
                <Header/>
                <section className="hero container is-jumbo is-first">
                    <div className="hero-body">
                        <div className="columns is-vcentered">
                            <div className="column has-text-left">
                                <p className="title">{problem.title}</p>
                                <p className="subtitle">{problem.tech}</p>
                            </div>
                            <div className="column is-one-quarter has-text-right">
                                <button onClick={() => downloadFiles()} className='button is-fourth'>
                                    <i className="icon fas fa-download"></i>
                                    &emsp;
                                    Download project files
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                <hr/>
                <div className="container">
                    <div className="columns">
                        <div className="column content">{problem.description ?
                        <ReactMarkdown>{problem.description}</ReactMarkdown> :
                        "Hmmm... There doesn't seem to be a description for this problem."}</div>
                        <div className="column is-one-third">
                            <h2 className="subtitle">Your submissions</h2>
                            <ul>
                                {submissionsList}
                            </ul>
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
    const res = await fetch('http://localhost:8000/api/problems', {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    });
    const problems = await res.json();

    const paths = problems.map((problem) => ({
        params: { id: `${problem.id}` }
    }));

    return { paths, fallback: false };
}

export async function getServerSideProps(context) {
    const session = await getSession(context);

    if (!session) {
        return { props: {} };
    }

    // params contains the post `id`.
    // If the route is like /posts/1, then params.id is 1
    const res = await fetch(`http://localhost:8000/api/problem/${context.params.problemId}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const problem = await res.json()

    const subRes = await fetch(`http://localhost:8000/api/problem/${problem.id}/submissions?user=${session.user.id}`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    });
    const submissions = await subRes.json();
  
    // Pass post data to the page via props
    return { props: { problem, submissions, session } }
}

export default Problem;