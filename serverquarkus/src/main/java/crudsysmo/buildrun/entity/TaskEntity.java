package crudsysmo.buildrun.entity;

import crudsysmo.buildrun.enums.TaskStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tb_task")

public class TaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "O título é obrigatório")
    @Column(name = "tx_titulo", nullable = false)
    private String title;

    @Column(name = "tx_descricao")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "tx_status")
    private TaskStatus status = TaskStatus.ABERTO;

    @CreationTimestamp
    @Column(name = "dt_criacao", updatable = false)
    private LocalDateTime createdAt;

    public TaskEntity() {
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

}
