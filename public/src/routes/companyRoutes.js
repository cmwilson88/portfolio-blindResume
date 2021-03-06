import CompanySidebar from '../components/MainLayout/Sidebars/CompanySidebar/CompanySidebar.vue'
import CompanyJobList from '../components/MainLayout/ContentSections/CompanyContent/CompanyJobListing/CompanyJobList.vue'
import LongCompanyJobPost from '../components/MainLayout/ContentSections/CompanyContent/CompanyJobListing/LongCompanyJobPost.vue'
import NewJobPost from '../components/MainLayout/ContentSections/CompanyContent/JobPost/NewJobPost.vue'
import ResumeViewer from '../components/MainLayout/ContentSections/CompanyContent/ResumeViewer/ResumeViewer.vue'
import SelectedCandidates from '../components/MainLayout/ContentSections/CompanyContent/SelectedCandidates/SelectedCandidates.vue'
import CompanyLanding from '../components/MainLayout/ContentSections/CompanyContent/CompanyJobListing/CompanyLanding.vue'


export const companyLanding = 
	{
		path: 'company',
		components: {
			content: CompanyLanding
		}
	}

export const companyMainRoute = 
	{
		path: 'company/:company_id',
		components: {
			sidebar: CompanySidebar,
			content: CompanyJobList
		}
	}

export const companyNewJobPostRoute = 
{
	path: 'company/:company_id/newJob',
	components: {
		sidebar: CompanySidebar,
		content: NewJobPost
	}	
}

export const companyJobPostRoute = 
{
	path: 'company/:company_id/:job_post_id',
	components: {
		sidebar: CompanySidebar,
		content: LongCompanyJobPost
	}
}

export const companyResumeViewerRoute = 
{
	path: 'company/:company_id/:job_post_id/resumes',
	components: {
		sidebar: CompanySidebar,
		content: ResumeViewer
	}
}

export const companyResumeViewerShortlistRoute = 
{
	path: 'company/:company_id/:job_post_id/shortlist',
	components: {
		sidebar: CompanySidebar,
		content: ResumeViewer
	}
}

export const companySelectedCandidatesRoute = 
{
	path: 'company/:company_id/:job_post_id/candidates',
	components: {
		sidebar: CompanySidebar,
		content: SelectedCandidates
	}
}