package com.tajfolio.companyms.company.impl;

import com.tajfolio.companyms.company.Company;
import com.tajfolio.companyms.company.CompanyRepository;
import com.tajfolio.companyms.company.CompanyService;
import com.tajfolio.companyms.event.CompanyEventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyEventPublisher companyEventPublisher;

    @Autowired
    public CompanyServiceImpl(CompanyRepository companyRepository, CompanyEventPublisher companyEventPublisher) {
        this.companyRepository = companyRepository;
        this.companyEventPublisher = companyEventPublisher;
    }

    @Override
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @Override
    public Company getCompanyById(Long id) {
        return companyRepository.findById(id).orElse(null);
    }

    @Override
    public void createCompany(Company company) {
        Company savedCompany = companyRepository.save(company);
        companyEventPublisher.publishCompanyCreatedEvent(savedCompany);
    }

    @Override
    public void updateCompany(Company company, Long id) {
        Optional<Company> existingCompany = companyRepository.findById(id);
        if (existingCompany.isPresent()) {
            Company updatedCompany = existingCompany.get();
            updatedCompany.setName(company.getName());
            updatedCompany.setDescription(company.getDescription());
            if (company.getWebsite() != null) updatedCompany.setWebsite(company.getWebsite());
            if (company.getLocation() != null) updatedCompany.setLocation(company.getLocation());
            if (company.getIndustry() != null) updatedCompany.setIndustry(company.getIndustry());
            if (company.getLogoUrl() != null) updatedCompany.setLogoUrl(company.getLogoUrl());
            companyRepository.save(updatedCompany);
            companyEventPublisher.publishCompanyUpdatedEvent(updatedCompany);
        }
    }

    @Override
    public boolean deleteCompany(Long id) {
        if (companyRepository.existsById(id)) {
            companyRepository.deleteById(id);
            companyEventPublisher.publishCompanyDeletedEvent(id);
            return true;
        }
        return false;
    }

    @Override
    public Company verifyCompany(Long id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setVerified(true);
        return companyRepository.save(company);
    }

    @Override
    public Company unverifyCompany(Long id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setVerified(false);
        return companyRepository.save(company);
    }

    @Override
    public void updateRating(Long companyId, double rating, int reviewCount) {
        companyRepository.findById(companyId).ifPresent(company -> {
            company.setAverageRating(rating);
            company.setReviewCount(reviewCount);
            companyRepository.save(company);
        });
    }
}
