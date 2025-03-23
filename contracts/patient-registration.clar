;; Patient Registration Contract
;; Records specific dietary requirements

;; Data Variables
(define-data-var patient-counter uint u0)

;; Data Maps
(define-map patients
  { patient-id: uint }
  {
    owner: principal,
    condition: (string-utf8 100),
    allergies: (list 10 (string-utf8 50)),
    restrictions: (list 10 (string-utf8 50)),
    timestamp: uint
  }
)

;; Register a new patient with dietary requirements
(define-public (register-patient
    (condition (string-utf8 100))
    (allergies (list 10 (string-utf8 50)))
    (restrictions (list 10 (string-utf8 50))))
  (let ((patient-id (var-get patient-counter)))
    (begin
      (map-set patients
        { patient-id: patient-id }
        {
          owner: tx-sender,
          condition: condition,
          allergies: allergies,
          restrictions: restrictions,
          timestamp: block-height
        }
      )
      (var-set patient-counter (+ patient-id u1))
      (ok patient-id)
    )
  )
)

;; Update patient dietary information
(define-public (update-patient-diet
    (patient-id uint)
    (allergies (list 10 (string-utf8 50)))
    (restrictions (list 10 (string-utf8 50))))
  (let ((patient-data (map-get? patients { patient-id: patient-id })))
    (if (and (is-some patient-data) (is-eq tx-sender (get owner (unwrap-panic patient-data))))
      (begin
        (map-set patients
          { patient-id: patient-id }
          (merge (unwrap-panic patient-data) {
            allergies: allergies,
            restrictions: restrictions,
            timestamp: block-height
          })
        )
        (ok true)
      )
      (err u1) ;; Simple error code
    )
  )
)

;; Get patient details by ID
(define-read-only (get-patient (patient-id uint))
  (map-get? patients { patient-id: patient-id })
)

;; Get the total number of registered patients
(define-read-only (get-patient-count)
  (var-get patient-counter)
)

