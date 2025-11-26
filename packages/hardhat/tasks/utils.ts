import fs from 'fs'
import path from 'path'

// Directory to store deployed contract addresses
const DEPLOYMENTS_DIR = path.join(__dirname, '../deployments')

// Ensure the deployments directory exists
if (!fs.existsSync(DEPLOYMENTS_DIR)) {
	fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true })
}

// Helper to get deployment file path for a network
const getDeploymentPath = (network: string) => path.join(DEPLOYMENTS_DIR, `${network}.json`)

// Helper to save deployment info
export const saveDeployment = (network: string, contractName: string, address: string) => {
	const deploymentPath = getDeploymentPath(network)

	let deployments: Record<string, string> = {}
	if (fs.existsSync(deploymentPath)) {
		deployments = JSON.parse(fs.readFileSync(deploymentPath, 'utf8')) as Record<string, string>
	}

	deployments[contractName] = address

	fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2))
	console.log(`Deployment saved to ${deploymentPath}`)
}

// Helper to get deployment info
export const getDeployment = (network: string, contractName: string): string | null => {
	const deploymentPath = getDeploymentPath(network)

	if (!fs.existsSync(deploymentPath)) {
		return null
	}

	const deployments = JSON.parse(fs.readFileSync(deploymentPath, 'utf8')) as Record<string, string>
	return deployments[contractName] || null
}
