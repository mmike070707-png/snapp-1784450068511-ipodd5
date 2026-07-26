import React, { useState } from 'react';

export default function App() {
  const [authRole, setAuthRole] = useState(null); // 'applicant' | 'employer' | 'admin' | null
  const [currentView, setCurrentView] = useState('home');
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState('Alex Morgan');
  const [userEmail, setUserEmail] = useState('alex.morgan@example.com');
  const [subscriptionActive, setSubscriptionActive] = useState(true);

  // Employer Subscription Tier State ('free' | 'paid')
  const [employerTier, setEmployerTier] = useState('free'); // default to free
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState('monthly'); // 'monthly' | 'annually'

  // Resume Data
  const [resumeData, setResumeData] = useState({
    summary: 'Experienced full-stack engineer specializing in React and modern web architectures.',
    experience: 'Senior Developer at TechCorp (2022-Present)\n- Built scalable front-end components using React and Tailwind CSS.',
    skills: 'React, JavaScript, Tailwind CSS, Node.js, Git'
  });

  // Jobs Feed & Employer Posting
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Senior React Developer', company: 'Apex Innovations', location: 'Remote', pay: '$140k - $170k', description: 'Looking for an experienced React engineer to lead our frontend architecture.' },
    { id: 2, title: 'AI Integration Specialist', company: 'Neural Systems', location: 'New York, NY', pay: '$150k - $190k', description: 'Develop intelligent agent integrations and automated screening pipelines.' }
  ]);
  const [appliedJobs, setAppliedJobs] = useState([]);

  // Employer Settings & Criteria
  const [employerSettings, setEmployerSettings] = useState({
    topCandidateCount: 10,
    instructions: 'Evaluate candidates strictly on technical depth, React experience, and clean code principles.',
    questionnaire: '1. Describe a complex state management challenge you solved.\n2. How do you ensure high performance in large-scale React apps?\n3. What is your experience with Tailwind CSS?'
  });

  // Employer Post Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobPay, setNewJobPay] = useState('');
  const [newJobLoc, setNewJobLoc] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [indeedSync, setIndeedSync] = useState(false);

  // Jason Styles AI State (Global Chat + Resume Integration + Interview Simulator)
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'jason', text: "Hello! I'm Jason Styles, your 40-year-old Senior AI Technical Recruiter. How can I assist you with your resume or screening today?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  
  // AI Video Interview Simulation State
  const [interviewActive, setInterviewActive] = useState(false);
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState([]);
  const [currentAnswerInput, setCurrentAnswerInput] = useState('');
  const [interviewReport, setInterviewReport] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleApply = (job) => {
    if (!authRole) {
      alert('You must sign up or log in to view and apply to the job feed!');
      setCurrentView('login');
      return;
    }
    if (authRole === 'applicant') {
      if (!appliedJobs.some(j => j.id === job.id)) {
        setAppliedJobs([...appliedJobs, job]);
        alert(`Successfully applied to ${job.title}! Jason Styles is now processing your resume against employer criteria.`);
      } else {
        alert(`You have already applied to ${job.title}.`);
      }
    } else {
      alert('Employer accounts browse the public feed. Log in as an applicant to apply.');
    }
  };

  const handlePostJob = (e) => {
    e.preventDefault();
    if (!newJobTitle || !newJobDesc) return;

    // Check tier limitations for free tier
    if (employerTier === 'free' && jobs.length >= 2) {
      alert('Free Employer Tier is limited to a maximum of 2 active job postings at a time. Upgrade to Paid Tier for full access and unlimited postings!');
      return;
    }

    const newJob = {
      id: jobs.length + 1,
      title: newJobTitle,
      company: 'Apex Innovations (Employer)',
      location: newJobLoc || 'Remote',
      pay: newJobPay || '$100k - $130k',
      description: newJobDesc
    };
    setJobs([newJob, ...jobs]);
    if (indeedSync) {
      if (employerTier !== 'paid') {
        alert('Indeed auto-sync requires the Paid Tier ($199/mo or $2,199/yr). Please upgrade your tier.');
        return;
      }
      alert('Job posted successfully and synced to Indeed feed automatically!');
    } else {
      alert('Job posted successfully to Live Feed!');
    }
    setNewJobTitle('');
    setNewJobPay('');
    setNewJobLoc('');
    setNewJobDesc('');
    setIndeedSync(false);
  };

  const handleSelectPaidPlan = (planType) => {
    setSelectedPlanType(planType);
    setShowTermsModal(true);
  };

  const confirmPaidPlanSubscription = () => {
    if (!termsAgreed) {
      alert('You must review and agree to the Terms and Conditions to proceed.');
      return;
    }
    setEmployerTier('paid');
    setShowTermsModal(false);
    alert(`Successfully subscribed to Paid Tier (${selectedPlanType === 'monthly' ? '$199/month' : '$2,199/annually'})! All features, employee tracking, and survey pipelines are now fully unlocked.`);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const newMsg = [...chatMessages, { sender: 'user', text: inputMessage }];
    setChatMessages(newMsg);
    setInputMessage('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { 
          sender: 'jason', 
          text: `I've analyzed your input through our forensic grading matrix. Let's make sure your resume highlights exact metric-driven outcomes for maximum employer appeal.` 
        }
      ]);
    }, 1000);
  };

  const startAiInterview = () => {
    setInterviewActive(true);
    setInterviewStep(0);
    setInterviewAnswers([]);
    setInterviewReport(null);
  };

  const submitInterviewAnswer = () => {
    if (!currentAnswerInput.trim()) return;
    const updatedAnswers = [...interviewAnswers, currentAnswerInput];
    setInterviewAnswers(updatedAnswers);
    setCurrentAnswerInput('');

    if (interviewStep < 2) {
      setInterviewStep(interviewStep + 1);
    } else {
      setInterviewActive(false);
      setInterviewReport({
        score: 96,
        summary: 'Exceptional communication and high technical alignment with employer benchmarks.',
        videoRecorded: 'recording_session_careergen_9841.mp4',
        timestamp: new Date().toLocaleString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative">
      {/* Navigation Header */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center px-8 shadow-md">
        <div className="text-xl font-bold tracking-wider text-blue-400 cursor-pointer flex items-center gap-3" onClick={() => setCurrentView('home')}>
          {profilePic && <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-blue-500" />}
          Career<span className="text-white">Generation</span>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <button onClick={() => setCurrentView('home')} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'home' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            Home
          </button>
          <button onClick={() => setCurrentView('jobs')} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'jobs' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            Jobs Feed {authRole ? '(Free)' : '(Login Required)'}
          </button>
          
          {authRole === 'applicant' && (
            <>
              <button onClick={() => setCurrentView('resume')} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'resume' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                Resume Builder
              </button>
              <button onClick={() => setCurrentView('profile')} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'profile' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                Profile & Settings
              </button>
              <button onClick={() => setCurrentView('applicant-dashboard')} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'applicant-dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                Applicant Dashboard
              </button>
            </>
          )}

          {authRole === 'employer' && (
            <>
              <button onClick={() => setCurrentView('employer-dashboard')} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'employer-dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                Employer Dashboard
              </button>
              <button onClick={() => setCurrentView('employer-pricing')} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'employer-pricing' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
                Pricing Tiers
              </button>
            </>
          )}

          {authRole === 'admin' && (
            <button onClick={() => setCurrentView('admin-dashboard')} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${currentView === 'admin-dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
              Admin Read-Only Dashboard
            </button>
          )}

          {!authRole ? (
            <button onClick={() => setCurrentView('login')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow transition">
              Login / Sign Up
            </button>
          ) : (
            <button onClick={() => { setAuthRole(null); setCurrentView('home'); }} className="px-3 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30 rounded-lg text-sm font-medium transition">
              Log Out
            </button>
          )}
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col pb-20">
        {currentView === 'home' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              CareerGeneration
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mb-8">
              The premier automated forensic-grade candidate screening, job board, and AI resume builder engine. Free for applicants; flexible tiers for employers.
            </p>
            <div className="flex gap-4 flex-wrap justify-center mb-6">
              <button onClick={() => setCurrentView('jobs')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition">
                Browse Live Jobs Feed (Free for Members)
              </button>
              <button onClick={() => { setAuthRole('applicant'); setCurrentView('resume'); }} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 shadow-lg transition">
                Build Resume with Jason
              </button>
            </div>
            {!authRole && (
              <div className="mt-4 flex gap-4">
                <button onClick={() => setCurrentView('login')} className="text-blue-400 hover:underline text-sm font-medium">
                  Login / Sign Up &rarr;
                </button>
                <button onClick={() => { setAuthRole('admin'); setCurrentView('admin-dashboard'); }} className="text-slate-400 hover:underline text-sm font-medium">
                  Admin Analytics Access &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'login' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2 text-center">CareerGeneration Portal Access</h2>
              <p className="text-slate-400 text-sm text-center mb-6">Sign up or log in to access the job feed, AI tools, and employer tiers.</p>
              
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setAuthRole('applicant'); setCurrentView('applicant-dashboard'); }}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition flex flex-col items-center"
                >
                  <span>Applicant Portal (Free Job Feed & Resume)</span>
                  <span className="text-xs text-blue-200 font-normal mt-0.5">Sign up / log in required to browse jobs</span>
                </button>

                <button 
                  onClick={() => { setAuthRole('employer'); setCurrentView('employer-dashboard'); }}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 shadow-lg transition flex flex-col items-center"
                >
                  <span>Employer Portal (Free & Paid Tiers)</span>
                  <span className="text-xs text-slate-400 font-normal mt-0.5">Manage jobs, tracking, survey pipelines & payments</span>
                </button>

                <button 
                  onClick={() => { setAuthRole('admin'); setCurrentView('admin-dashboard'); }}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium rounded-xl border border-slate-700 text-xs transition"
                >
                  Admin Analytics Access (Read-Only)
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'jobs' && (
          <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Live Job Postings</h1>
                <p className="text-slate-400 text-sm mt-1">Explore live employer postings. 100% free for applicants with account access.</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">Applicant Feed: Free</span>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {jobs.map(job => (
                <div key={job.id} className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition">
                  <div>
                    <h3 className="text-xl font-bold text-white">{job.title}</h3>
                    <p className="text-blue-400 font-medium text-sm mt-0.5">{job.company} • <span className="text-slate-400">{job.location}</span></p>
                    <p className="text-slate-300 text-sm mt-3 max-w-2xl">{job.description}</p>
                    <div className="mt-3 inline-block bg-slate-900 border border-slate-800 text-emerald-400 px-3 py-1 rounded-lg text-xs font-semibold">
                      {job.pay}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleApply(job)}
                    className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow transition"
                  >
                    {!authRole ? 'Login to Apply (Free)' : 'Apply Now (Free)'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'employer-pricing' && (
          <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white">Employer Subscription Tiers</h1>
              <p className="text-slate-400 text-sm mt-2">Choose the plan that fits your recruiting pipeline and tracking needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Tier Card */}
              <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl flex flex-col justify-between">
                <div>
                  <span className="bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1 rounded-full text-xs font-semibold">Current Plan</span>
                  <h3 className="text-2xl font-bold text-white mt-4">Free Tier</h3>
                  <p className="text-4xl font-extrabold text-blue-400 mt-2">$0 <span className="text-sm font-normal text-slate-400">/ forever</span></p>
                  <p className="text-slate-300 text-sm mt-4">Ideal for small businesses testing our recruitment pipeline.</p>
                  <ul className="space-y-3 mt-6 text-sm text-slate-300">
                    <li className="flex items-center gap-2">✅ Up to 2 active job position postings at a time</li>
                    <li className="flex items-center gap-2">✅ Standard applicant feed access</li>
                    <li className="flex items-center gap-2 text-slate-500">❌ Full app features & Indeed auto-sync</li>
                    <li className="flex items-center gap-2 text-slate-500">❌ Employee tracking & survey dashboard</li>
                  </ul>
                </div>
                <div className="mt-8">
                  <button onClick={() => { setEmployerTier('free'); alert('Switched to Free Tier (max 2 postings active).'); }} className={`w-full py-3 rounded-xl font-semibold text-sm transition ${employerTier === 'free' ? 'bg-slate-800 text-white border border-slate-700' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}>
                    {employerTier === 'free' ? 'Active Tier' : 'Select Free Tier'}
                  </button>
                </div>
              </div>

              {/* Paid Tier Card */}
              <div className="bg-slate-950 border border-blue-500/50 p-8 rounded-3xl flex flex-col justify-between relative shadow-2xl">
                <div className="absolute -top-3 right-8 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Full Access
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mt-2">Paid Tier</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">$199</span>
                    <span className="text-sm text-slate-400">/ month</span>
                    <span className="text-slate-600">or</span>
                    <span className="text-2xl font-extrabold text-emerald-400">$2,199</span>
                    <span className="text-sm text-slate-400">/ annually</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">Save $189 per year with annual billing!</p>
                  <p className="text-slate-300 text-sm mt-4">For organizations requiring complete recruitment automation, employee tracking, and surveys.</p>
                  <ul className="space-y-3 mt-6 text-sm text-slate-300">
                    <li className="flex items-center gap-2">✅ Unlimited active job position postings</li>
                    <li className="flex items-center gap-2">✅ Full access to all app features & Indeed auto-sync</li>
                    <li className="flex items-center gap-2">✅ Forensic candidate grading & Jason AI recruiter</li>
                    <li className="flex items-center gap-2">✅ Hired employee tracking & survey results presented in dashboard</li>
                  </ul>
                </div>
                <div className="mt-8 flex gap-3">
                  <button onClick={() => handleSelectPaidPlan('monthly')} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow">
                    Select $199/mo
                  </button>
                  <button onClick={() => handleSelectPaidPlan('annually')} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow">
                    Select $2,199/yr (Save $189)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'resume' && (
          <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">AI Resume Builder</h1>
                <p className="text-slate-400 text-sm">Craft and refine your professional profile with Jason Styles integrated into your editing flow.</p>
              </div>
              <button onClick={() => setChatOpen(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
                <span>💬 Consult Jason</span>
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Professional Summary</label>
                <textarea 
                  value={resumeData.summary}
                  onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Work Experience</label>
                <textarea 
                  value={resumeData.experience}
                  onChange={(e) => setResumeData({...resumeData, experience: e.target.value})}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Key Skills</label>
                <input 
                  type="text" 
                  value={resumeData.skills}
                  onChange={(e) => setResumeData({...resumeData, skills: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button onClick={() => alert('Resume updated successfully with Jason integration!')} className="self-end px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition">
                Save Resume
              </button>
            </div>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
            <h1 className="text-2xl font-bold text-white mb-6">Profile & Settings</h1>
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col gap-6">
              <div className="flex items-center gap-6 pb-6 border-b border-slate-800">
                <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center">
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-500 text-xs">No Image</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Upload Profile Picture</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-800">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-2">Subscription & Account Cancellation</h3>
                <p className="text-slate-400 text-sm mb-4">Manage your account status and membership options.</p>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">Free Jobs Feed & Applicant Account</p>
                    <p className="text-xs text-slate-400 mt-0.5">Status: <span className={subscriptionActive ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>{subscriptionActive ? "Active" : "Cancelled"}</span></p>
                  </div>
                  {subscriptionActive ? (
                    <button onClick={() => { if(confirm('Are you sure you want to cancel your account?')) setSubscriptionActive(false); }} className="px-4 py-2 bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30 text-sm font-semibold rounded-xl transition">
                      Cancel Account
                    </button>
                  ) : (
                    <button onClick={() => setSubscriptionActive(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition">
                      Reactivate Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'applicant-dashboard' && (
          <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-6">
              {profilePic && <img src={profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-blue-500" />}
              <div>
                <h1 className="text-2xl font-bold text-white">Applicant Dashboard</h1>
                <p className="text-slate-400 text-sm">Welcome back, {userName}. Track your applications and AI interview status.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm">Applications Submitted</p>
                <p className="text-3xl font-extrabold text-blue-400 mt-1">{appliedJobs.length}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm">AI Screening Status</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">Active</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm">Account Status</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">{subscriptionActive ? 'Active' : 'Cancelled'}</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Your Applied Positions</h3>
              {appliedJobs.length === 0 ? (
                <p className="text-slate-400 text-sm">You haven't applied to any positions yet. Check out the <button onClick={() => setCurrentView('jobs')} className="text-blue-400 underline">Jobs Feed</button>.</p>
              ) : (
                <div className="space-y-3">
                  {appliedJobs.map(job => (
                    <div key={job.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white">{job.title}</h4>
                        <p className="text-xs text-blue-400">{job.company} • {job.location}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-semibold">Passed AI Top 10 Screen</span>
                        <button onClick={startAiInterview} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition">
                          Start Jason Video Interview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'employer-dashboard' && (
          <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-white">Employer Dashboard & Employee Tracking</h1>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${employerTier === 'paid' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                  Tier: {employerTier === 'paid' ? 'Paid Tier ($199/mo or $2,199/yr)' : 'Free Tier (Max 2 Postings)'}
                </span>
                {employerTier === 'free' && (
                  <button onClick={() => setCurrentView('employer-pricing')} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition">
                    Upgrade to Paid
                  </button>
                )}
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-8">Post jobs, manage candidate screening, and monitor tracked hired employee survey results.</p>

            {/* Post Job & Indeed Integration Section */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Post New Job to Live Feed & Indeed</h3>
                <p className="text-xs text-slate-400">Active postings: <span className="text-blue-400 font-bold">{jobs.length}</span> {employerTier === 'free' && '(Max limit: 2)'}</p>
              </div>
              <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Job Title</label>
                  <input type="text" value={newJobTitle} onChange={(e) => setNewJobTitle(e.target.value)} placeholder="e.g. Senior Frontend Architect" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Compensation Range</label>
                  <input type="text" value={newJobPay} onChange={(e) => setNewJobPay(e.target.value)} placeholder="e.g. $150k - $180k" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                  <input type="text" value={newJobLoc} onChange={(e) => setNewJobLoc(e.target.value)} placeholder="e.g. Remote / Chicago, IL" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={indeedSync} onChange={(e) => setIndeedSync(e.target.checked)} className="w-5 h-5 rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-slate-300">Auto-sync and post to Indeed Feed {employerTier !== 'paid' && '(Paid Tier Required)'}</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Job Description</label>
                  <textarea value={newJobDesc} onChange={(e) => setNewJobDesc(e.target.value)} rows={3} placeholder="Describe responsibilities and requirements..." className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500" required />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition">
                    Publish Job Post
                  </button>
                </div>
              </form>
            </div>

            {/* Employee Tracking & Survey Results Dashboard Section (Paid Tier Feature) */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Hired Employee Tracking & Survey Results Dashboard</h3>
                  <p className="text-slate-400 text-sm mt-0.5">Results of employee tracking and automated survey pipelines as mandated by Terms of Service.</p>
                </div>
                {employerTier !== 'paid' && (
                  <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-semibold">Locked: Paid Tier Required</span>
                )}
              </div>

              {employerTier === 'paid' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <p className="text-slate-400 text-xs">Total Tracked Employees</p>
                      <p className="text-2xl font-bold text-emerald-400 mt-1">14 Active</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <p className="text-slate-400 text-xs">Survey Response Rate</p>
                      <p className="text-2xl font-bold text-blue-400 mt-1">94.2%</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                      <p className="text-slate-400 text-xs">Productivity Index Score</p>
                      <p className="text-2xl font-bold text-indigo-400 mt-1">98.1 / 100</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-sm">Alex Morgan (Senior React Developer) - Hired</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Tracking Status: Active • Survey Completed (Q3 Metric Check)</p>
                      <p className="text-xs text-emerald-400 mt-1">Performance Feedback: Exceptional code delivery, high engagement on sprint goals.</p>
                    </div>
                    <button onClick={() => alert('Exporting full employee survey logs and telemetry report...')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition">
                      Export Survey Data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center">
                  <p className="text-slate-300 font-medium mb-2">Employee Tracking and Survey Dashboards are available on the Paid Tier.</p>
                  <p className="text-slate-400 text-xs mb-4">Upgrade to $199/mo or $2,199/yr to unlock full access, employee telemetry, and admin reports.</p>
                  <button onClick={() => setCurrentView('employer-pricing')} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition">
                    View Pricing Tiers & Upgrade
                  </button>
                </div>
              )}
            </div>

            {/* Jason AI Criteria & Settings Section */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl mb-8">
              <h3 className="text-lg font-bold text-white mb-2">Jason Styles AI Screener Criteria & Instructions</h3>
              <p className="text-slate-400 text-sm mb-4">Configure how Jason evaluates applicants, weeds out candidates to your preset Top X threshold, and emails questionnaires.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Preset Top Candidate Threshold (#)</label>
                  <input type="number" value={employerSettings.topCandidateCount} onChange={(e) => setEmployerSettings({...employerSettings, topCandidateCount: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Evaluation Instructions for Jason</label>
                  <input type="text" value={employerSettings.instructions} onChange={(e) => setEmployerSettings({...employerSettings, instructions: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-1">15-Point Questionnaire (Emailed automatically to applicants passing screen)</label>
                <textarea value={employerSettings.questionnaire} onChange={(e) => setEmployerSettings({...employerSettings, questionnaire: e.target.value})} rows={4} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <button onClick={() => alert('Employer screening criteria saved successfully!')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition">
                Save Criteria Settings
              </button>
            </div>
          </div>
        )}

        {currentView === 'admin-dashboard' && (
          <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Analytics Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">Read-only master oversight of platform usage, subscription tiers, and telemetry data.</p>
              </div>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold">Access: Read-Only Admin</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm">Total Employers</p>
                <p className="text-3xl font-extrabold text-white mt-1">342</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm">Paid Tier Subscribers</p>
                <p className="text-3xl font-extrabold text-blue-400 mt-1">128</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm">Total Applicants</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">4,890</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                <p className="text-slate-400 text-sm">Tracked Employees</p>
                <p className="text-3xl font-extrabold text-indigo-400 mt-1">312</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Platform Revenue & Plan Distribution</h3>
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">Monthly Subscriptions ($199/mo)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Active accounts on monthly recurring payment schedule.</p>
                  </div>
                  <span className="text-blue-400 font-bold">84 Accounts ($16,716/mo)</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">Annual Subscriptions ($2,199/yr)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Active accounts on annual schedule (saving users $189).</p>
                  </div>
                  <span className="text-emerald-400 font-bold">44 Accounts ($96,756/yr)</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">Free Tier Accounts ($0)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Limited to 2 active job postings.</p>
                  </div>
                  <span className="text-slate-300 font-bold">214 Accounts</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-4">System Telemetry & Survey Pipeline Logs</h3>
              <p className="text-slate-400 text-sm mb-4">Read-only audit of automated employee tracking and survey response results across client companies.</p>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 font-mono space-y-2">
                <p>[2026-07-26 07:44] SURVEY_PIPE: Telemetry sync completed for 312 active hired personnel.</p>
                <p>[2026-07-26 07:30] PAYMENT_GATEWAY: Recurring charge processed successfully for Employer ID #9821 ($199.00).</p>
                <p>[2026-07-26 07:15] COMPLIANCE: Terms of Service agreement verified for Paid Tier subscription upgrade.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Jason Styles AI Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen ? (
          <button 
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-3 rounded-full shadow-2xl border border-blue-400/30 transition transform hover:scale-105"
          >
            <div className="w-9 h-9 rounded-full bg-slate-950 border border-blue-400 overflow-hidden flex items-center justify-center font-bold text-blue-400 text-sm">
              JS
            </div>
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">Jason Styles</p>
              <p className="text-[10px] text-blue-200 leading-tight">AI Recruiter & Screener</p>
            </div>
          </button>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-96 h-[500px] flex flex-col overflow-hidden">
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">JS</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Jason Styles</h3>
                  <p className="text-[10px] text-blue-400">Senior AI Recruiter (Age 40)</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold px-2">✕</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 text-sm">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-3 rounded-xl max-w-[85%] ${msg.sender === 'user' ? 'ml-auto bg-blue-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-200'}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900 flex gap-2">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Jason for resume/interview help..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" 
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">Send</button>
            </form>
          </div>
        )}
      </div>

      {/* Detailed Terms and Conditions Modal for Paid Tier Subscription */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 flex flex-col shadow-2xl relative max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Terms of Service & Payment Agreement</h2>
                <p className="text-xs text-blue-400">Selected Plan: {selectedPlanType === 'monthly' ? '$199 / month' : '$2,199 / annually (Saving $189)'}</p>
              </div>
              <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            {/* Scrollable Detailed Terms Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs text-slate-300 bg-slate-950 border border-slate-800 p-4 rounded-xl mb-6">
              <h4 className="font-bold text-white text-sm">CAREERGENERATION MASTER SUBSCRIPTION & TRACKING AGREEMENT</h4>
              <p>
                <strong>1. Payment Terms & Billing Formats:</strong> By clicking "I Agree & Subscribe" below, you authorize CareerGeneration to immediately charge your designated payment method for the selected subscription tier: either $199.00 USD billed on a recurring monthly basis, or $2,199.00 USD billed annually (reflecting a $189.00 savings compared to monthly billing). Subscriptions renew automatically unless cancelled prior to the renewal date through your employer settings portal. All fees are non-refundable.
              </p>
              <p>
                <strong>2. Employee Tracking & Telemetry Mandate:</strong> As an employer utilizing the Paid Tier of CareerGeneration, you explicitly acknowledge, agree, and consent that all candidates hired through the platform, as well as their ongoing workplace performance metrics, task progression, and milestone completions, shall be systematically tracked via our proprietary telemetry engine.
              </p>
              <p>
                <strong>3. Automated Surveys & Feedback Pipelines:</strong> You agree that hired employees will automatically receive periodic surveys, 15-point evaluations, and productivity questionnaires generated by the platform. The resulting data, telemetry logs, and survey responses will be aggregated and presented in real-time within your employer dashboard as well as the platform's administrative analytics oversight.
              </p>
              <p>
                <strong>4. Data Privacy & Compliance:</strong> All tracking and survey protocols adhere strictly to enterprise data standards. Employers agree to notify newly hired personnel of this mandatory performance tracking and survey regimen during onboarding in accordance with applicable regional labor guidelines.
              </p>
              <p>
                <strong>5. Limitation of Liability:</strong> CareerGeneration provides forensic screening, candidate matching, and tracking tools on an "as-is" basis and assumes no direct liability for employment hiring outcomes or individual performance variances.
              </p>
            </div>

            {/* Agreement Checkbox */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={termsAgreed} 
                  onChange={(e) => setTermsAgreed(e.target.checked)} 
                  className="w-5 h-5 mt-0.5 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500" 
                />
                <span className="text-xs text-slate-200 font-medium leading-relaxed">
                  I have read, understood, and agree to the detailed Terms of Service, including automatic recurring payment formats, employee tracking, and mandatory survey reporting.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <button onClick={() => setShowTermsModal(false)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition">
                Cancel
              </button>
              <button 
                onClick={confirmPaidPlanSubscription} 
                disabled={!termsAgreed}
                className={`px-6 py-2.5 text-white text-xs font-semibold rounded-xl transition shadow ${termsAgreed ? 'bg-blue-600 hover:bg-blue-500 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
              >
                I Agree & Subscribe ({selectedPlanType === 'monthly' ? '$199/mo' : '$2,199/yr'})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Video Interview Modal Simulation */}
      {interviewActive && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-8 flex flex-col shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">JS</div>
                <div>
                  <h2 className="text-xl font-bold text-white">Jason Styles - AI Video Interview</h2>
                  <p className="text-xs text-blue-400">Mahogany Office Studio • Automated Forensic Evaluation</p>
                </div>
              </div>
              <button onClick={() => setInterviewActive(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            {/* Video Simulation Box */}
            <div className="w-full h-64 bg-slate-950 border border-slate-800 rounded-2xl mb-6 relative overflow-hidden flex flex-col items-center justify-center text-center p-6">
              <div className="absolute top-4 left-4 bg-rose-600/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> REC (Session #9841)
              </div>
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-blue-500 flex items-center justify-center text-2xl font-extrabold text-blue-400 mb-3 shadow-inner">
                JS
              </div>
              <p className="text-white font-semibold text-base mb-1">Jason Styles (40-year-old Professional Technical Recruiter)</p>
              <p className="text-slate-300 text-sm italic max-w-lg">
                "{interviewStep === 0 ? "Welcome to your technical interview. Question 1: Describe a complex state management challenge you solved recently." : interviewStep === 1 ? "Question 2: How do you optimize rendering performance in large React applications?" : "Question 3: What is your approach to maintaining secure API connections?"}"
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-slate-300">Your Answer (Audio/Text Stream):</label>
              <textarea 
                value={currentAnswerInput}
                onChange={(e) => setCurrentAnswerInput(e.target.value)}
                rows={3}
                placeholder="Type your spoken response or test transcript..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500"
              />
              <button onClick={submitInterviewAnswer} className="self-end px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition">
                {interviewStep < 2 ? 'Submit Answer & Proceed' : 'Complete Interview & Generate Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Completed Report Popup */}
      {interviewReport && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Interview Completed!</h2>
            <p className="text-slate-400 text-sm mb-6">Jason Styles has finalized grading and recorded the session for the employer.</p>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 mb-6 text-sm">
              <p className="text-white font-medium">Score: <span className="text-emerald-400 font-bold">{interviewReport.score}/100</span></p>
              <p className="text-slate-300">{interviewReport.summary}</p>
              <p className="text-xs text-blue-400 pt-2">Saved to Database File: {interviewReport.videoRecorded}</p>
            </div>
            <button onClick={() => setInterviewReport(null)} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition">
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
