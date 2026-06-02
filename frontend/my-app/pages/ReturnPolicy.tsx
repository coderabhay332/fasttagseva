import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardBody, CardHeader } from '../components/ui/Card';

export default function ReturnPolicy() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-gray-900 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-elegant-lg">
						<span className="text-white text-2xl font-bold">F</span>
					</div>
					<h1 className="text-3xl font-bold gradient-text mb-2">Return & Refund Policy</h1>
					<p className="text-gray-600">Last updated: June 2026</p>
				</div>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">1. Overview</h2>
					</CardHeader>
					<CardBody>
						<p className="text-gray-600">
							At Fastag Seva, we strive to provide excellent service for all your FASTag 
							application needs. This Return and Refund Policy outlines the terms under 
							which refunds may be issued for our services.
						</p>
					</CardBody>
				</Card>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">2. Eligible Refund Scenarios</h2>
					</CardHeader>
					<CardBody>
						<p className="text-gray-600 mb-4">
							Refunds may be issued under the following circumstances:
						</p>
						<div className="space-y-4">
							<div className="bg-green-50 border-l-4 border-green-500 p-4">
								<h3 className="font-semibold text-green-800 mb-1">Application Rejected by Bank</h3>
								<p className="text-green-700 text-sm">
									Full refund will be issued if your FASTag application is rejected by the 
									issuing bank due to reasons beyond your control.
								</p>
							</div>
							
							<div className="bg-green-50 border-l-4 border-green-500 p-4">
								<h3 className="font-semibold text-green-800 mb-1">Duplicate Payment</h3>
								<p className="text-green-700 text-sm">
									Full refund for any accidental duplicate payments made for the same application.
								</p>
							</div>
							
							<div className="bg-green-50 border-l-4 border-green-500 p-4">
								<h3 className="font-semibold text-green-800 mb-1">Service Not Delivered</h3>
								<p className="text-green-700 text-sm">
									If we fail to process your application within 15 business days, you may 
									request a full refund.
								</p>
							</div>
							
							<div className="bg-green-50 border-l-4 border-green-500 p-4">
								<h3 className="font-semibold text-green-800 mb-1">Technical Error</h3>
								<p className="text-green-700 text-sm">
									Full refund for payments made due to technical errors where service was 
									not rendered.
								</p>
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">3. Non-Refundable Scenarios</h2>
					</CardHeader>
					<CardBody>
						<p className="text-gray-600 mb-4">
							Refunds will NOT be issued in the following cases:
						</p>
						<ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
							<li>Application rejected due to incorrect information provided by the customer</li>
							<li>Change of mind after successful application submission</li>
							<li>Verification failed due to invalid or fraudulent documents</li>
							<li>FASTag tag already dispatched to the provided address</li>
							<li>Customer provides incorrect vehicle or contact information</li>
						</ul>
					</CardBody>
				</Card>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">4. Refund Process</h2>
					</CardHeader>
					<CardBody>
						<div className="space-y-4">
							<div className="flex items-start space-x-4">
								<div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
								<div>
									<h3 className="font-semibold text-gray-800">Submit Request</h3>
									<p className="text-gray-600 text-sm">
										Contact our support team at support@fasttagseva.com with your order ID 
										and reason for refund.
									</p>
								</div>
							</div>
							
							<div className="flex items-start space-x-4">
								<div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
								<div>
									<h3 className="font-semibold text-gray-800">Review</h3>
									<p className="text-gray-600 text-sm">
										Our team will review your request within 3-5 business days and verify 
										the eligibility.
									</p>
								</div>
							</div>
							
							<div className="flex items-start space-x-4">
								<div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
								<div>
									<h3 className="font-semibold text-gray-800">Refund Issued</h3>
									<p className="text-gray-600 text-sm">
										If approved, refund will be processed to your original payment method 
										within 5-7 business days.
									</p>
								</div>
							</div>
						</div>
					</CardBody>
				</Card>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">5. Refund Timeline</h2>
					</CardHeader>
					<CardBody>
						<table className="w-full text-sm text-left">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-4 py-2 rounded-tl-lg">Payment Method</th>
									<th className="px-4 py-2 rounded-tr-lg">Refund Timeline</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								<tr>
									<td className="px-4 py-3">Credit/Debit Card</td>
									<td className="px-4 py-3">5-7 business days</td>
								</tr>
								<tr>
									<td className="px-4 py-3">UPI</td>
									<td className="px-4 py-3">2-5 business days</td>
								</tr>
								<tr>
									<td className="px-4 py-3">Net Banking</td>
									<td className="px-4 py-3">5-7 business days</td>
								</tr>
								<tr>
									<td className="px-4 py-3">Wallets (Paytm, etc.)</td>
									<td className="px-4 py-3">Instant to 2 days</td>
								</tr>
							</tbody>
						</table>
					</CardBody>
				</Card>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">6. Cancellation Policy</h2>
					</CardHeader>
					<CardBody>
						<p className="text-gray-600 mb-4">
							You may cancel your FASTag application under the following conditions:
						</p>
						<ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
							<li>
								<strong>Before Verification:</strong> Full refund if cancelled before 
								document verification begins.
							</li>
							<li>
								<strong>During Processing:</strong> 50% refund if cancelled after 
								verification but before dispatch.
							</li>
							<li>
								<strong>After Dispatch:</strong> No refund once the FASTag tag has been 
								dispatched.
							</li>
						</ul>
					</CardBody>
				</Card>

				<Card className="shadow-elegant-lg mb-6">
					<CardHeader>
						<h2 className="text-xl font-semibold">7. Contact for Refunds</h2>
					</CardHeader>
					<CardBody>
						<div className="bg-gray-50 rounded-lg p-4">
							<p className="text-gray-700 mb-2"><strong>Email:</strong> support@fasttagseva.com</p>
							<p className="text-gray-700 mb-2"><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</p>
							<p className="text-gray-700"><strong>Response Time:</strong> Within 24-48 hours</p>
						</div>
						<p className="text-gray-600 mt-4 text-sm">
							Please include your Order ID, registered email, and reason for refund 
							in your communication.
						</p>
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
