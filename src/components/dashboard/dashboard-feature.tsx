export function DashboardFeature() {

  const text = "This dApp helps you store your passwords and keys on the blockchain. It uses Argon2 for encryption before saving them securely on-chain. Only you can decrypt your data with your password.";

  return (
    <div className='w-full flex flex-row gap-7 items-center justify-between mt-10'>
      <p className='text-white text-[60px] w-1/2'>Glad to see you!</p>
      <p className='text-white text-[20px] w-1/2'>{text}</p>
    </div>
  )
}
