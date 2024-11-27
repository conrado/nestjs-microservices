import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateWorkflowDto } from '../../../../libs/workflows/src/dto/create-workflow.dto';
import { UpdateWorkflowDto } from '../../../../libs/workflows/src/dto/update-workflow.dto';
import { Workflow } from './entities/workflow.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);
  constructor(
    @InjectRepository(Workflow)
    private workflowsRepository: Repository<Workflow>,
  ) {}

  async findAll(): Promise<Workflow[]> {
    return this.workflowsRepository.find();
  }

  async findOne(id: number): Promise<Workflow> {
    const workflow = await this.workflowsRepository.findOne({ where: { id } });
    if (!workflow) {
      throw new NotFoundException(`Workflow #${id} not found`);
    }
    return workflow;
  }

  async create(createWorkflowDto: CreateWorkflowDto): Promise<Workflow> {
    const workflow = this.workflowsRepository.create(createWorkflowDto);
    const newWorkflowEntity = await this.workflowsRepository.save(workflow);
    this.logger.debug(
      `Created workflow with id: ${newWorkflowEntity.id} for buildingId: ${newWorkflowEntity.buildingId}`,
    );
    return newWorkflowEntity;
  }

  async update(
    id: number,
    updateWorkflowDto: UpdateWorkflowDto,
  ): Promise<Workflow> {
    const workflow = await this.workflowsRepository.preload({
      id: +id,
      ...updateWorkflowDto,
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow #${id} not found`);
    }
    return this.workflowsRepository.save(workflow);
  }

  async remove(id: number): Promise<Workflow> {
    const workflow = await this.findOne(id);
    return this.workflowsRepository.remove(workflow);
  }
}
