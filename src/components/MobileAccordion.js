import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const MobileAccordion = ({ title, children, defaultExpanded = true, className = "" }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={`mobile-accordion ${className}`}>
            <div className="mobile-accordion-header" onClick={() => setExpanded(!expanded)}>
                <h4 className="section-header-gold">{title}</h4>
                <FontAwesomeIcon className="mobile-accordion-icon" icon={expanded ? faChevronUp : faChevronDown} style={{ color: '#c49b63' }} />
            </div>
            <div className={`mobile-accordion-content ${expanded ? 'expanded' : 'collapsed'}`}>
                {children}
            </div>
        </div>
    );
};

export default MobileAccordion;
