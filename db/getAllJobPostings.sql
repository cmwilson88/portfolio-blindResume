select c.name company, c.city, c.state, jp.title, i.name industry, jt.name job_type, jp.job_description, jp.responsibilities, jp.qualifications, 
    (
        select array_to_json(array_agg(d))
        from (
            select k.name from keywords k
            where k.job_post_id = jp.id
            order by k.name
        ) d
    ) as job_keywords,
    jp.date_posted
    from job_postings jp
    join companies c on c.id = jp.company_id
    join industries i on i.id = jp.industry_id
    join job_types jt on jt.id = jp.job_type_id;