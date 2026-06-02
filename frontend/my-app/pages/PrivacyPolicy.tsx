import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody, CardHeader } from '../components/ui/Card';

export default function PrivacyPolicy() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-gray-900 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-elegant-lg">
						<span className="text-white text-2xl font-bold">F</span>
					</div>
					<h1 className="text-3xl font-bold gradient-text mb-2">Privacy Policy</h1>
					<p className="text-gray-600">Last updated: June 2026</p>
				</div>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">1. Information We Collect</h2>
					</CardHeader>
					<CardBody>
						<p className="text-gray-600 mb-4">
							We collect information you provide directly to us when you:
						</p>
						<ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
							<li>Create an account (name, email, phone number)</li>
							<li>Complete your profile (address, PAN card details)</li>
							<li>Submit FASTag applications (vehicle details, documents)</li>
							<li>Make payments (processed securely through Razorpay)</li>
							<li>Contact our support team</li>
						</ul>
					</CardBody>
				</Card>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
					</CardHeader>
					<CardBody>
						<p className="text-gray-600 mb-4">
							We use the information we collect to:
						</p>
						<ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
							<li>Process and manage your FASTag applications</li>
							<li>Verify your identity and documents</li>
							<li>Process payments and issue refunds</li>
							<li>Communicate with you about your applications</li>
							<li>Improve our services and user experience</li>
							<li>Comply with legal and regulatory requirements</li>
						</ul>
					</CardBody>
				</Card>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">3. Payment Information</h2>
					</CardHeader>
					<CardBody>
						<p className="text-gray-600 mb-4">
							We do not store your payment card details. All payment transactions are 
							processed securely through Razorpay, a PCI-DSS compliant payment gateway. 
							Your payment information is encrypted and handled directly by Razorpay.
						</p>
						<p className="text-gray-600">
							We only store transaction IDs, payment status, and timestamps for 
							record-keeping and refund purposes.
						</p>
					</CardBody>
				</Card>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">4. Data Security</h2>
					</CardHeader>
					<CardBody>
						<p className="text-gray-600 mb-4">
							We implement appropriate technical and organizational security measures 
							to protect your personal information:
						</p>
						<ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
							<li>SSL/TLS encryption for all data transmission</li>
							<li>Secure cloud storage with access controls</li>
							<li>Regular security audits and monitoring</li>
							<li>Limited access to personal information by authorized personnel only</li>
						</ul>
					</CardBody>
				</Card>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">5. Your Rights</h2>
					</CardHeader>
					<CardBody>
						<p className="text-gray-600 mb-4">
							You have the right to:
						</p>
						<ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
							<li>Access your personal information</li>
							<li>Request correction of inaccurate data</li>
							<li>Request deletion of your account and data</li>
							<li>Opt out of marketing communications</li>
							<li>Download your data in a portable format</li>
						</ul>
						<p className="text-gray-600 mt-4">
							To exercise these rights, contact us at support@fasttagseva.com
						</p>
					</CardBody>
				</Card>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">6. Contact Us</h2>
					</CardHeader>
					<CardBody>
						<p className="text-gray-600 mb-4">
							If you have any questions about this Privacy Policy or our data practices, 
							please contact us:
						</p>
						<div className="bg-gray-50 rounded-lg p-4">
							<p className="text-gray-700"><strong>Email:</strong> support@fasttagseva.com</p>
							<p className="text-gray-700"><strong>Business Name:</strong> Fastag Seva</p>
							<p className="text-gray-700"><strong>Website:</strong> https://fasttagseva.com</p>
						</div>
					</CardBody>
				</Card>

				{/* Footer */}
				<div className="text-center mt-8">
					<Link to="/" className="text-gray-600 hover:text-gray-900 underline">
						← Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}
