'use client'
export default function Home() {
  const connectGmail = () => {
    window.location.href = '/api/auth';
  };

  return (
    <div className='container'>
      <h1>Read Emails</h1>
      <button onClick={connectGmail} style={{ padding: '10px 20px' }}>
        Connect Gmail
      </button>
    </div>
  );
}
