import Link from 'next/link'
import { Github, Linkedin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

const members = [
    {
        name: 'Ashwini Jaiswal',
        role: 'Full Stack Developer',
        avatar: '/Ashwini.png',
        linkedin: 'http://linkedin.com/in/ashwini-jaiswal-095165282',
        github: 'https://github.com/jaiashwinisatish',
    },
    {
        name: 'Muneer Ali',
        role: 'Backend Developer',
        avatar: '/muneer.png',
        linkedin: 'https://www.linkedin.com/in/muneer-ali',
        github: 'https://www.github.com/Muneerali199',
    },
    {
        name: 'Aniket Tonk',
        role: 'Frontend Developer',
        avatar: '/Aniket.png',
        linkedin: 'https://www.linkedin.com/in/aayush-tonk',
        github: '#',
    },
    {
        name: 'Stuti Mishra',
        role: 'UI/UX Designer',
        avatar: '/stuti.png',
        linkedin: 'https://www.linkedin.com/in/stuti-mishra-216876376',
        github: '#',
    },
    {
        name: 'Aditya Kumar Tiwari',
        role: 'Team Lead & Full Stack Developer',
        avatar: '/1.png',
        linkedin: 'https://www.linkedin.com/in/itisaddy/',
        github: 'https://github.com/Xenonesis',
    },
]

export default function TeamSection() {
    return (
        <section className="py-12 md:py-16">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
                {/* Team Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        Code_Blitz Team
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                        Meet Our Hackathon Team
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        The passionate developers and designers behind Budget Buddy, brought together by innovation and driven by excellence.
                    </p>
                </div>

                {/* Team Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {members.map((member, index) => (
                        <div key={index} className="group relative">
                            {/* Card */}
                            <div className="relative overflow-hidden rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-muted hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                                {/* Background Pattern */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                {/* Avatar */}
                                <div className="relative p-6 pb-4">
                                    <div className="relative mx-auto w-24 h-24 mb-4">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-full blur-md group-hover:blur-lg transition-all duration-500"></div>
                                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-background shadow-lg">
                                            <img 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                src={member.avatar} 
                                                alt={member.name}
                                                onError={(e) => {
                                                    // Fallback to a placeholder if image fails to load
                                                    const target = e.currentTarget;
                                                    if (!target.src.includes('ui-avatars.com')) {
                                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=6366f1&color=fff&size=200&bold=true`;
                                                    }
                                                }}
                                                onLoad={(e) => {
                                                    // Ensure image loaded successfully
                                                    e.currentTarget.style.opacity = '1';
                                                }}
                                                style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Member Info */}
                                    <div className="text-center relative z-10">
                                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                                            {member.name}
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-4">
                                            {member.role}
                                        </p>
                                        
                                        {/* Social Links */}
                                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                            {member.linkedin && member.linkedin !== '#' && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full hover:bg-blue-500/10 hover:border-blue-500/20 hover:text-blue-600 transition-all"
                                                    asChild
                                                >
                                                    <Link href={member.linkedin} target="_blank" rel="noopener noreferrer">
                                                        <Linkedin className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            {member.github && member.github !== '#' && (
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full hover:bg-gray-500/10 hover:border-gray-500/20 hover:text-gray-600 transition-all"
                                                    asChild
                                                >
                                                    <Link href={member.github} target="_blank" rel="noopener noreferrer">
                                                        <Github className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Hover Effect Border */}
                                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-all duration-500"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-violet-500/5 border border-primary/10">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">5</div>
                        <div className="text-sm text-muted-foreground">Team Members</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">36h</div>
                        <div className="text-sm text-muted-foreground">Hackathon Duration</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">100+</div>
                        <div className="text-sm text-muted-foreground">Commits</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">1</div>
                        <div className="text-sm text-muted-foreground">Amazing App</div>
                    </div>
                </div>
            </div>
        </section>
    )
}