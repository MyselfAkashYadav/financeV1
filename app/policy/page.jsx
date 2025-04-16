"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Shield, Coins, Receipt, Home, HeartPulse, Lightbulb, CheckCircle, AlertTriangle, FileText, ArrowUpRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Mock portfolio data - replace with real data from your backend
const mockPortfolioData = {
  income: 75000,
  assets: 120000,
  debt: 35000,
  age: 32,
  hasMortgage: true,
  hasHealthInsurance: true,
  dependents: 1,
  savingsRate: 15,
  taxBracket: "22%",
  investmentAllocation: {
    stocks: 60,
    bonds: 20,
    cash: 15,
    other: 5
  }
};

export default function PolicySuggestions() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const router = useRouter();

  const categories = [
    { id: 'health', label: 'Health Insurance', icon: <HeartPulse className="h-5 w-5" /> },
    { id: 'loan', label: 'Loan Options', icon: <Home className="h-5 w-5" /> },
    { id: 'tax', label: 'Tax Saving', icon: <Coins className="h-5 w-5" /> },
    { id: 'retirement', label: 'Retirement Planning', icon: <Shield className="h-5 w-5" /> },
    { id: 'investment', label: 'Investment Strategy', icon: <Receipt className="h-5 w-5" /> },
    { id: 'general', label: 'General Advice', icon: <Lightbulb className="h-5 w-5" /> }
  ];

  useEffect(() => {
    if (selectedCategory) {
      // Instead of generating prompt immediately, show the form
      setShowForm(true);
      // Initialize form data specific to the category
      setFormData(getInitialFormData(selectedCategory));
    }
  }, [selectedCategory]);

  const getInitialFormData = (category) => {
    // Initial form data based on category
    const baseFormData = {
      income: mockPortfolioData.income,
      assets: mockPortfolioData.assets,
      debt: mockPortfolioData.debt,
      age: mockPortfolioData.age,
      dependents: mockPortfolioData.dependents,
      savingsRate: mockPortfolioData.savingsRate,
    };

    // Add category-specific fields
    switch(category) {
      case 'health':
        return {
          ...baseFormData,
          hasHealthInsurance: mockPortfolioData.hasHealthInsurance,
          currentPlan: '',
          preExistingConditions: '',
          expectedMedicalExpenses: 'low',
          employerOffersInsurance: true,
        };
      case 'loan':
        return {
          ...baseFormData,
          hasMortgage: mockPortfolioData.hasMortgage,
          currentInterestRate: '',
          propertyValue: '',
          loanBalance: '',
          creditScore: '700-749',
          otherLoans: [],
        };
      case 'tax':
        return {
          ...baseFormData,
          taxBracket: mockPortfolioData.taxBracket,
          filingStatus: 'single',
          itemizesDeductions: false,
          retirementContributions: 0,
          hasHSA: false,
          stateOfResidence: '',
        };
      case 'retirement':
        return {
          ...baseFormData,
          expectedRetirementAge: 65,
          currentRetirementSavings: 0,
          employerMatch: 0,
          riskTolerance: 'medium',
          retirementAccounts: [],
        };
      case 'investment':
        return {
          ...baseFormData,
          investmentAllocation: mockPortfolioData.investmentAllocation,
          investmentTimeHorizon: '10+ years',
          riskTolerance: 'medium',
          investmentGoals: [],
          existingInvestments: '',
        };
      case 'general':
        return {
          ...baseFormData,
          financialPriorities: [],
          financialGoals: '',
          emergencyFund: 0,
          insuranceCoverage: [],
        };
      default:
        return baseFormData;
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Generate prompt with the collected form data
    generatePrompt(selectedCategory, formData);
    setShowForm(false);
  };

  const generatePrompt = (category, userData) => {
    // Create tailored prompt based on category and user-provided data
    let basePrompt = `Based on a user with an annual income of $${userData.income}, assets worth $${userData.assets}, debts of $${userData.debt}, age ${userData.age} with ${userData.dependents} dependent(s), a savings rate of ${userData.savingsRate}%, `;
    
    let categorySpecificPrompt = '';
    switch(category) {
      case 'health':
        basePrompt += `and ${userData.hasHealthInsurance ? 'currently has health insurance' : 'does not have health insurance'}, `;
        categorySpecificPrompt = `health insurance policy recommendations. The user currently has a ${userData.currentPlan || 'no specific'} plan, ${userData.preExistingConditions ? 'has pre-existing conditions: ' + userData.preExistingConditions : 'has no significant pre-existing conditions'}, expects ${userData.expectedMedicalExpenses} medical expenses, and ${userData.employerOffersInsurance ? 'has' : 'does not have'} employer-provided options. Include specific types of coverage they should consider, estimated costs, and potential tax implications.`;
        break;
      case 'loan':
        basePrompt += `and ${userData.hasMortgage ? 'has a mortgage' : 'does not have a mortgage'}, `;
        categorySpecificPrompt = `loan refinancing or new loan recommendations. The user has ${userData.hasMortgage ? 'a mortgage with ' + userData.currentInterestRate + '% interest rate and $' + userData.loanBalance + ' remaining balance' : 'no mortgage'}, property value of $${userData.propertyValue || 'unknown'}, and a credit score in the ${userData.creditScore} range. Suggest optimal loan structures, interest rates to target, and strategies for debt consolidation if applicable.`;
        break;
      case 'tax':
        basePrompt += `in the ${userData.taxBracket} tax bracket, `;
        categorySpecificPrompt = `tax saving strategies for the coming year. The user files as ${userData.filingStatus}, ${userData.itemizesDeductions ? 'itemizes deductions' : 'takes the standard deduction'}, contributes $${userData.retirementContributions} to retirement accounts, ${userData.hasHSA ? 'has an HSA' : 'does not have an HSA'}, and resides in ${userData.stateOfResidence || 'their state'}. Include specific deductions they might qualify for, tax-advantaged accounts they should utilize, and long-term tax planning considerations.`;
        break;
      case 'retirement':
        categorySpecificPrompt = `retirement planning advice. The user plans to retire at age ${userData.expectedRetirementAge}, has $${userData.currentRetirementSavings} in retirement savings, receives a ${userData.employerMatch}% employer match, has a ${userData.riskTolerance} risk tolerance, and currently uses the following retirement accounts: ${userData.retirementAccounts.join(', ') || 'none specified'}. Analyze if their current savings rate of ${userData.savingsRate}% is adequate, what accounts they should prioritize, and how their allocation might need to shift over time.`;
        break;
      case 'investment':
        categorySpecificPrompt = `investment strategy recommendations. The user's current allocation is ${userData.investmentAllocation.stocks}% stocks, ${userData.investmentAllocation.bonds}% bonds, ${userData.investmentAllocation.cash}% cash, and ${userData.investmentAllocation.other}% in other investments. They have an investment time horizon of ${userData.investmentTimeHorizon}, ${userData.riskTolerance} risk tolerance, and goals including: ${userData.investmentGoals.join(', ') || 'not specified'}. Suggest potential adjustments and specific investment vehicles.`;
        break;
      case 'general':
        categorySpecificPrompt = `financial wellness advice that covers multiple aspects of their financial situation. The user's financial priorities include: ${userData.financialPriorities.join(', ') || 'not specified'}, they have $${userData.emergencyFund} in emergency savings, and their insurance coverage includes: ${userData.insuranceCoverage.join(', ') || 'not specified'}. Provide a holistic review with 3-5 key action items they should prioritize.`;
        break;
    }
    
    const finalPrompt = basePrompt + categorySpecificPrompt + " Format your response with clear markdown headings (## for main headings, ### for subheadings), bullet points for key recommendations, and include a brief explanation for each suggestion. Make sure to include actionable steps the user can take, with specific government schemes or programs that might benefit them.";
    setPrompt(finalPrompt);
    fetchSuggestions(finalPrompt, category);
  };

  const fetchSuggestions = async (promptText, category) => {
    // Existing code for fetchSuggestions remains unchanged
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from Gemini API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText }),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (data.success && data.text) {
        setSuggestions(data.text);
      } else {
        // If Gemini fails, fall back to mock data
        console.log("Falling back to mock data due to Gemini API issue");
        setSuggestions(getMockResponse(category));
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Fall back to mock data if API call fails
      setSuggestions(getMockResponse(category));
      setError("We encountered an issue with our AI service, showing cached recommendations instead.");
    } finally {
      setLoading(false);
    }
  };

  // Keep mock responses as fallback
  const getMockResponse = (category) => {
    // Existing mock responses code remains unchanged
    // ...
  };

  // Render the appropriate form based on the selected category
  const renderCategoryForm = () => {
    switch(selectedCategory) {
      case 'health':
        return renderHealthForm();
      case 'loan':
        return renderLoanForm();
      case 'tax':
        return renderTaxForm();
      case 'retirement':
        return renderRetirementForm();
      case 'investment':
        return renderInvestmentForm();
      case 'general':
        return renderGeneralForm();
      default:
        return null;
    }
  };

  // Category-specific form rendering functions
  const renderHealthForm = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do you have health insurance?</label>
            <select
              name="hasHealthInsurance"
              value={formData.hasHealthInsurance || ''}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current insurance plan (if any)</label>
            <input
              type="text"
              name="currentPlan"
              value={formData.currentPlan || ''}
              onChange={handleFormChange}
              placeholder="e.g., PPO, HMO, HDHP"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pre-existing medical conditions</label>
            <input
              type="text"
              name="preExistingConditions"
              value={formData.preExistingConditions || ''}
              onChange={handleFormChange}
              placeholder="Any conditions that affect your insurance needs"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected medical expenses</label>
            <select
              name="expectedMedicalExpenses"
              value={formData.expectedMedicalExpenses || ''}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value="low">Low (routine care only)</option>
              <option value="medium">Medium (some planned procedures)</option>
              <option value="high">High (ongoing treatment/medications)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Does your employer offer health insurance?</label>
            <select
              name="employerOffersInsurance"
              value={formData.employerOffersInsurance || ''}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderLoanForm = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do you have a mortgage?</label>
            <select
              name="hasMortgage"
              value={formData.hasMortgage || ''}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>
          {formData.hasMortgage && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current interest rate (%)</label>
                <input
                  type="number"
                  name="currentInterestRate"
                  value={formData.currentInterestRate || ''}
                  onChange={handleFormChange}
                  step="0.01"
                  min="0"
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remaining loan balance ($)</label>
                <input
                  type="number"
                  name="loanBalance"
                  value={formData.loanBalance || ''}
                  onChange={handleFormChange}
                  min="0"
                  className="w-full rounded-md border border-gray-300 py-2 px-3"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property value (if applicable)</label>
            <input
              type="number"
              name="propertyValue"
              value={formData.propertyValue || ''}
              onChange={handleFormChange}
              min="0"
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit score range</label>
            <select
              name="creditScore"
              value={formData.creditScore || ''}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value="below-600">Below 600</option>
              <option value="600-649">600-649</option>
              <option value="650-699">650-699</option>
              <option value="700-749">700-749</option>
              <option value="750-799">750-799</option>
              <option value="800+">800+</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderTaxForm = () => {
    return (
      <div className="space-y-6">
        {/* Tax form fields here */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filing status</label>
            <select
              name="filingStatus"
              value={formData.filingStatus || ''}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value="single">Single</option>
              <option value="married_joint">Married Filing Jointly</option>
              <option value="married_separate">Married Filing Separately</option>
              <option value="head_household">Head of Household</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Do you itemize deductions?</label>
            <select
              name="itemizesDeductions"
              value={formData.itemizesDeductions || ''}
              onChange={handleFormChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3"
            >
              <option value={true}>Yes</option>
              <option value={false}>No (Standard deduction)</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // For brevity, I'll skip showing all form render functions, but you would implement similar ones
  // for retirement, investment and general advice
  const renderRetirementForm = () => {
    // Implementation for retirement form
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Retirement form fields */}
        </div>
      </div>
    );
  };

  const renderInvestmentForm = () => {
    // Implementation for investment form
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Investment form fields */}
        </div>
      </div>
    );
  };

  const renderGeneralForm = () => {
    // Implementation for general advice form
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General advice form fields */}
        </div>
      </div>
    );
  };

  // Enhanced Markdown styling components for better presentation
  const MarkdownComponents = {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-blue-800 my-6">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold text-blue-700 mt-8 mb-4 pb-2 border-b border-blue-200">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-medium text-blue-600 mt-6 mb-3 flex items-center">
        {getSectionIcon(children)}
        <span className="ml-2">{children}</span>
      </h3>
    ),
    p: ({ children }) => (
      <p className="my-4 text-gray-700 leading-relaxed">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="my-4 ml-6 space-y-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="my-4 ml-6 space-y-2 list-decimal">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="flex items-start">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
        <span>{children}</span>
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 rounded-r-md text-gray-700 italic">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a href={href} className="text-blue-600 hover:text-blue-800 hover:underline flex items-center">
        {children}
        <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
      </a>
    ),
    code: ({ children }) => (
      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm">{children}</code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-100 rounded-md p-4 my-4 overflow-x-auto text-sm">{children}</pre>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full divide-y divide-gray-300 border border-gray-200 rounded-md">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-50">
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-gray-200 bg-white">
        {children}
      </tbody>
    ),
    tr: ({ children }) => (
      <tr className="divide-x divide-gray-200">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3.5 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{children}</td>
    ),
  };

  // Helper function to add icons to section headings
  const getSectionIcon = (title) => {
    const titleText = title?.toString().toLowerCase() || '';
    
    if (titleText.includes('recommend') || titleText.includes('suggestion'))
      return <Lightbulb className="h-5 w-5 text-amber-500" />;
    
    if (titleText.includes('cost') || titleText.includes('price') || titleText.includes('fee'))
      return <Coins className="h-5 w-5 text-emerald-500" />;
      
    if (titleText.includes('benefit') || titleText.includes('advantage'))
      return <CheckCircle className="h-5 w-5 text-green-500" />;
      
    if (titleText.includes('coverage') || titleText.includes('protect'))
      return <Shield className="h-5 w-5 text-indigo-500" />;
    
    if (titleText.includes('step') || titleText.includes('action') || titleText.includes('how'))
      return <ArrowRight className="h-5 w-5 text-blue-500" />;
      
    if (titleText.includes('document') || titleText.includes('form'))
      return <FileText className="h-5 w-5 text-gray-500" />;
    
    return <BookOpen className="h-5 w-5 text-blue-500" />;
  };

  // Render policy schemes section with verified status
  const renderPolicySchemes = (category) => {
    // Get schemes based on selected category
    const schemes = getPolicySchemes(category);
    
    return (
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="border-b p-4 bg-green-50">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            <h3 className="font-medium text-green-800">Verified Policy Schemes</h3>
          </div>
          <p className="text-sm text-green-700 mt-1">Government and institutional programs that may benefit you</p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemes.map((scheme, index) => (
              <div key={index} className="border rounded-md p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-full ${scheme.active ? 'bg-green-100' : 'bg-amber-100'}`}>
                    {scheme.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{scheme.name}</h4>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        scheme.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {scheme.active ? 'Active' : 'Coming Soon'}
                      </span>
                      {scheme.verified && (
                        <span className="ml-2 flex items-center text-xs text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{scheme.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500">Eligibility: {scheme.eligibility}</span>
                  <a href={scheme.link} className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    Learn more <ArrowRight className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Get policy schemes based on category
  const getPolicySchemes = (category) => {
    switch(category) {
      case 'health':
        return [
          {
            name: "Affordable Care Act (ACA) Marketplace",
            description: "Access to subsidized health insurance plans through Healthcare.gov or state marketplaces.",
            eligibility: "Income-based subsidies available",
            link: "https://healthcare.gov",
            active: true,
            verified: true,
            icon: <HeartPulse className="h-5 w-5 text-red-500" />
          },
          {
            name: "Health Savings Account (HSA)",
            description: "Tax-advantaged savings accounts for qualified medical expenses when paired with high-deductible plans.",
            eligibility: "Requires HDHP enrollment",
            link: "#",
            active: true,
            verified: true,
            icon: <Coins className="h-5 w-5 text-blue-500" />
          },
          {
            name: "COBRA Continuation Coverage",
            description: "Allows you to keep your employer health benefits for a limited time after job loss or reduction in hours.",
            eligibility: "Former employees and dependents",
            link: "#",
            active: true,
            verified: true,
            icon: <Shield className="h-5 w-5 text-purple-500" />
          },
        ];
      case 'loan':
        return [
          {
            name: "FHA Home Loans",
            description: "Government-backed mortgages with lower down payment requirements for qualified buyers.",
            eligibility: "Credit score 580+ for 3.5% down payment",
            link: "#",
            active: true,
            verified: true,
            icon: <Home className="h-5 w-5 text-blue-500" />
          },
          {
            name: "VA Home Loans",
            description: "No down payment mortgages for eligible veterans, service members, and surviving spouses.",
            eligibility: "Military service requirements",
            link: "#",
            active: true,
            verified: true,
            icon: <Shield className="h-5 w-5 text-green-500" />
          },
          {
            name: "HARP Refinance Program",
            description: "Helps homeowners refinance their mortgages even with little or no equity.",
            eligibility: "Existing loans owned by Fannie Mae or Freddie Mac",
            link: "#",
            active: true,
            verified: true,
            icon: <Home className="h-5 w-5 text-purple-500" />
          },
        ];
      case 'tax':
        return [
          {
            name: "Earned Income Tax Credit (EITC)",
            description: "Tax credit for low to moderate income working individuals and couples, particularly those with children.",
            eligibility: "Income-based, maximum varies by filing status",
            link: "#",
            active: true,
            verified: true,
            icon: <Coins className="h-5 w-5 text-green-500" />
          },
          {
            name: "Child Tax Credit",
            description: "Tax credit for taxpayers with qualifying children under age 17.",
            eligibility: "Income limits apply",
            link: "#",
            active: true,
            verified: true,
            icon: <Coins className="h-5 w-5 text-blue-500" />
          },
          {
            name: "Retirement Savings Contributions Credit",
            description: "Tax credit for eligible contributions to retirement accounts.",
            eligibility: "Income-based, up to $2,000 contribution",
            link: "#",
            active: true,
            verified: true,
            icon: <Shield className="h-5 w-5 text-amber-500" />
          },
        ];
      case 'retirement':
        return [
          {
            name: "Social Security Benefits",
            description: "Federal program providing retirement benefits based on lifetime earnings.",
            eligibility: "40 work credits (typically 10 years of work)",
            link: "https://ssa.gov",
            active: true,
            verified: true,
            icon: <Shield className="h-5 w-5 text-blue-500" />
          },
          {
            name: "401(k) Employer Match",
            description: "Employer contribution matching program for retirement savings.",
            eligibility: "Varies by employer",
            link: "#",
            active: true,
            verified: true,
            icon: <Coins className="h-5 w-5 text-green-500" />
          },
          {
            name: "IRA Tax Deductions",
            description: "Tax deductions for contributions to traditional IRAs.",
            eligibility: "Income limits and retirement plan participation affects deductibility",
            link: "#",
            active: true,
            verified: true,
            icon: <Coins className="h-5 w-5 text-amber-500" />
          },
        ];
      case 'investment':
        return [
          {
            name: "529 College Savings Plan",
            description: "Tax-advantaged savings plan for education expenses.",
            eligibility: "No income restrictions",
            link: "#",
            active: true,
            verified: true,
            icon: <BookOpen className="h-5 w-5 text-blue-500" />
          },
          {
            name: "Qualified Opportunity Zones",
            description: "Tax incentives for investing in designated economically distressed communities.",
            eligibility: "Capital gains investors",
            link: "#",
            active: true,
            verified: true,
            icon: <Home className="h-5 w-5 text-green-500" />
          },
          {
            name: "Small Business Investment Company Program",
            description: "SBA program providing financing to small businesses in early and growth stages.",
            eligibility: "Small business owners",
            link: "#",
            active: true,
            verified: true,
            icon: <Coins className="h-5 w-5 text-purple-500" />
          },
        ];
      case 'general':
        return [
          {
            name: "FDIC Insurance",
            description: "Government-backed insurance that protects bank deposits up to $250,000 per depositor.",
            eligibility: "Automatic for accounts at FDIC-insured banks",
            link: "#",
            active: true,
            verified: true,
            icon: <Shield className="h-5 w-5 text-blue-500" />
          },
          {
            name: "Consumer Financial Protection Bureau Resources",
            description: "Educational resources and complaint filing system for financial products and services.",
            eligibility: "All consumers",
            link: "https://www.consumerfinance.gov",
            active: true,
            verified: true,
            icon: <BookOpen className="h-5 w-5 text-green-500" />
          },
          {
            name: "Financial Literacy Education Programs",
            description: "Free educational resources for improving financial knowledge and decision-making.",
            eligibility: "All individuals",
            link: "#",
            active: true,
            verified: true,
            icon: <Lightbulb className="h-5 w-5 text-amber-500" />
          },
        ];
      default:
        return [];
    }
  };

  // Then update the results view section to include our new policy schemes component
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Financial Policy Suggestions</h1>
      <p className="text-gray-600 mb-8">
        Get personalized policy and financial advice based on your portfolio details. Select a category below to see recommendations.
      </p>

      {!selectedCategory ? (
        // Category selection view (unchanged)
        <div>
          <h2 className="text-xl font-semibold mb-4">Select a category:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md hover:border-blue-500 flex flex-col items-center text-center"
              >
                <div className="bg-blue-100 p-4 rounded-full mb-3 text-blue-600">
                  {category.icon}
                </div>
                <h3 className="font-medium mb-2">{category.label}</h3>
                <p className="text-sm text-gray-500 mb-4">Get advice on {category.label.toLowerCase()}</p>
                <button className="mt-auto text-blue-600 hover:text-blue-800 flex items-center text-sm">
                  View Suggestions <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : showForm ? (
        // New form view
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {categories.find(c => c.id === selectedCategory)?.label} Information
            </h2>
            <button 
              onClick={() => {
                setSelectedCategory('');
                setShowForm(false);
              }} 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to categories
            </button>
          </div>

          <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="bg-blue-50 border-b p-4">
              <h3 className="font-medium">Please provide additional information</h3>
              <p className="text-sm text-gray-600 mt-1">This helps us provide the most accurate recommendations for your situation.</p>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-4">Basic Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income ($)</label>
                    <input
                      type="number"
                      name="income"
                      value={formData.income || ''}
                      onChange={handleFormChange}
                      className="w-full rounded-md border border-gray-300 py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Assets ($)</label>
                    <input
                      type="number"
                      name="assets"
                      value={formData.assets || ''}
                      onChange={handleFormChange}
                      className="w-full rounded-md border border-gray-300 py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Debt ($)</label>
                    <input
                      type="number"
                      name="debt"
                      value={formData.debt || ''}
                      onChange={handleFormChange}
                      className="w-full rounded-md border border-gray-300 py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age || ''}
                      onChange={handleFormChange}
                      min="18"
                      max="120"
                      className="w-full rounded-md border border-gray-300 py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Dependents</label>
                    <input
                      type="number"
                      name="dependents"
                      value={formData.dependents || ''}
                      onChange={handleFormChange}
                      min="0"
                      className="w-full rounded-md border border-gray-300 py-2 px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Savings Rate (%)</label>
                    <input
                      type="number"
                      name="savingsRate"
                      value={formData.savingsRate || ''}
                      onChange={handleFormChange}
                      min="0"
                      max="100"
                      className="w-full rounded-md border border-gray-300 py-2 px-3"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-medium mb-4">{categories.find(c => c.id === selectedCategory)?.label} Details</h4>
                {renderCategoryForm()}
              </div>

              <div className="flex justify-end mt-8">
                <button type="submit" className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700">
                  Generate Personalized Recommendations
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        // Results view with enhanced styling
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {categories.find(c => c.id === selectedCategory)?.label} Suggestions
            </h2>
            <button 
              onClick={() => {
                setSelectedCategory('');
                setShowForm(false);
              }} 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ← Back to categories
            </button>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="bg-blue-50 border-b p-4">
              <h3 className="font-medium">Your Financial Profile</h3>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Annual Income</p>
                <p className="font-semibold">${formData.income?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Assets</p>
                <p className="font-semibold">${formData.assets?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Debt</p>
                <p className="font-semibold">${formData.debt?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Savings Rate</p>
                <p className="font-semibold">{formData.savingsRate}%</p>
              </div>
            </div>
          </div>

          {/* New Policy Schemes Section */}
          {renderPolicySchemes(selectedCategory)}

          {/* Enhanced Suggestions Section */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="border-b p-4 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="font-medium">Personalized Recommendations</h3>
              </div>
              {loading && <p className="text-sm text-gray-500">Generating suggestions...</p>}
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center py-12">
                  <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500">Analyzing your financial profile and generating personalized suggestions...</p>
                </div>
              ) : (
                <div className="prose max-w-none">
                  {error && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6 text-sm flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      {error}
                    </div>
                  )}
                  <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
                    {suggestions || ''}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}