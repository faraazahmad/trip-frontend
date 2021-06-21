import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/client';

export default function Header() {
    const [session, loadng] = useSession();

    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className='container'>
                <div className="navbar-brand">
                    <Link href='/'><a className='navbar-item logo'>Trip</a></Link>

                    <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false">
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>

                <div className="navbar-menu ">
                    <div className="navbar-start">
                        <Link href='/problems'><a className='navbar-item'>Problems</a></Link>
                        <Link href='/companies'><a className='navbar-item'>Companies</a></Link>
                    </div>

                    <div className="navbar-end">
                        {!session && <>
                            <span className="navbar-item"><Link href="/signin"><a className='button is-link'>Sign In</a></Link></span>
                            <span className="navbar-item"><Link href="/signup"><a className='button is-light'>Sign Up</a></Link></span>
                        </>}
                        
                        {session && <>
                            <span className='navbar-item has-text-weight-bold'>{session.user.username}</span>
                            <span className='navbar-item' onClick={() => signOut()}>Sign out</span>
                        </>}
                    </div>
                </div>
            </div>
        </nav>
    );
}