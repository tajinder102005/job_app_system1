package com.tajfolio.companyms.company;

import java.util.List;

public interface CompanyService {
    List<Company> getAllCompanies();
    void updateCompany(Company company, Long id);
    void createCompany(Company company);
    boolean deleteCompany(Long id);
    Company getCompanyById(Long id);
    Company verifyCompany(Long id);
    Company unverifyCompany(Long id);
    void updateRating(Long companyId, double rating, int reviewCount);
}
