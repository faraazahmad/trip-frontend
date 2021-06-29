import { useSession, getSession } from "next-auth/client";
import {parseDiff, Diff, Hunk, Decoration} from 'react-diff-view';
import SyntaxHighlighter from 'react-syntax-highlighter';
import Link from "next/link";
import Header from '../header';
import { xcode } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { useMemo } from "react";

export default function Submission({submission, problem, session}) {
    const files = useMemo(() => parseDiff(submission.diff, {
        nearbySequences: "zip"
    }))

    const renderFile = ({oldPath, newPath, oldRevision, newRevision, type, hunks}) => (
        <div key={oldRevision + '-' + newRevision} className="file-diff">
            <header className="diff-header">{oldPath === newPath ? oldPath : `${oldPath} -> ${newPath}`}</header>
            <Diff viewType="split" diffType={type} hunks={hunks}>
                {hunks =>
                    hunks.map(hunk => [
                        <Decoration key={'deco-' + hunk.content}>
                            <div className="hunk-header">{hunk.content}</div>
                        </Decoration>,
                        <Hunk key={hunk.content} hunk={hunk} />,
                    ])
                }
            </Diff>
        </div>
    );

    return <>
        <Header/>
        <section className="hero container">
            <div className="hero-body">
                <div className="columns is-vcentered">
                    <div className="column has-text-left">
                        <p className="title">Submission</p>
                        <p className="subtitle">
                            #{submission.id} for &nbsp;
                            <Link href={`/problems/${problem.id}`}><a>{problem.title}</a></Link>
                        </p>
                    </div>
                    <div className="column is-one-quarter has-text-right">
                        <p className="subtitle">STATUS</p>
                        <p className="title">{submission.status}</p>
                    </div>
                </div>
            </div>
        </section>
        <hr/>
        <div className="container">
            <h1 className="title">Your result</h1>
            <SyntaxHighlighter language="bash" style={xcode} showLineNumbers={true} lineNumberStyle={{color: "lightGrey"}}>
                {submission.test_result}
            </SyntaxHighlighter>
            <br/>
            <h1 className="title">Your changes</h1>
            {files.map(renderFile)}
        </div>
    </>
}

export async function getServerSideProps(context) {
    const session = await getSession(context);
    const url = `http://localhost:8000/api/submissions/${context.params.submissionId}/`;
    // params contains the post `id`.
    // If the route is like /posts/1, then params.id is 1
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const submission = await res.json()

    const problemRes = await fetch(`http://localhost:8000/api/problem/${submission.problem}/`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    })
    const problem = await problemRes.json()
  
    // Pass post data to the page via props
    return { props: { submission, problem, session } }
}

export async function getServerSidePaths(context) {
    const session = await getSession(context);
    const res = await fetch(`http://localhost:8000/api/submissions?user=${session.user.id}`, {
        headers: {
            'Authorization': `Bearer ${session.tokens.access}`
        }
    });
    const submissions = await res.json();

    const paths = submissions.map((submission) => ({
        params: { id: `${submission.id}` }
    }));

    return { paths, fallback: false };
}