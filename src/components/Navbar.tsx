
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { buttonVariants } from './ui/Button'
import SignInButton from './ui/SignInButton'
import SignOutButton from './ui/SignOutButton'

const Navbar = async () => {
  const session = await getServerSession(authOptions)
console.log('session', session)
  return (
    <div className='fixed backdrop-blur-sm bg-white/75 dark:bg-slate-900/75 z-50 top-0 left-0 right-0 h-20 border-b border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-between'>
      <div className='container max-w-7xl mx-auto w-full flex justify-between items-center'>
        <Link href='/' className={buttonVariants({ variant: 'link' })}>
          Text & Number v1.0  <span className='text-sm text-red-400 hover:text-orange-400' >&nbsp; by Pranjal</span>
        </Link>

        <div className='md:hidden'>
          <ThemeToggle />
        </div>

        <div className='hidden md:flex gap-4'>
        <ThemeToggle /> 
          <Link
            href='/'
            className={buttonVariants({ variant: 'subtle' })}>
            Home
          </Link>
          <Link
            href='/documentation'
            className={buttonVariants({ variant: 'ghost' })}>
            Documentation
          </Link>
          <Link
            href='https://github.com/pranjal6314/' 
            target="_blank"
            className={buttonVariants({ variant: 'ghost' })}>
        GitHub
          </Link>
          {session ? (
            <>
              <Link
                className={buttonVariants({ variant: 'ghost' })}
                href='/dashboard'>
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar